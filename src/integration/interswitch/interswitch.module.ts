import { Module, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InterSwitchService } from './interswitch.service';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { INTERSWITCH_BASIC_TOKEN_KEY } from './interswitch.constants';
import type { Cache } from 'cache-manager';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [InterSwitchService],
  exports: [InterSwitchService],
})
export class InterSwitchModule implements OnModuleInit {
  private readonly logger = new Logger(InterSwitchModule.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly interSwitchService: InterSwitchService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  onModuleInit() {
    this.logger.log('InterSwitchModule.onModuleInit', 'hello', 'msg');
    if ((InterSwitchModule as any).interceptorsRegistered) return;
    (InterSwitchModule as any).interceptorsRegistered = true;

    const axios = this.httpService.axiosRef;
    // Request interceptor: inject headers
    axios.interceptors.request.use(
      async (config) => {
        if (config.headers?.skipAuth) return config; // bypass

        const token = await this.interSwitchService.getToken();
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['terminalId'] = this.config.get(
          'interswitchTerminalId',
        )!;

        this.logger.debug(`➡️ ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('❌ Request error', error.message);
        return Promise.reject(error);
      },
    );

    // Response interceptor: retry on 401
    axios.interceptors.response.use(
      (res) => {
        this.logger.debug(`✅ ${res.status} ${res.config.url}`);
        return res;
      },
      async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        // If Unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          // Invalidate cached token then fetch a new one
          try {
            await this.cacheManager
              .del(INTERSWITCH_BASIC_TOKEN_KEY)
              .catch(() => {});
            const newToken = await this.interSwitchService.getToken(true); // forceRefresh
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            this.logger.warn(
              `Retrying ${originalRequest.url} with refreshed token`,
            );
            return axios(originalRequest);
          } catch (refreshErr) {
            this.logger.error(
              'Token refresh failed for retry',
              refreshErr?.message ?? refreshErr,
            );
            return Promise.reject(refreshErr);
          }
        }

        this.logger.error(
          `Response error: ${error.response?.status} ${error.config?.url}`,
          error.response?.data ?? error.message,
        );
        return Promise.reject(error);
      },
    );
  }
}
