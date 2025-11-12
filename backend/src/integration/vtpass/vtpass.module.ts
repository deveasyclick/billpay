import { HttpModule, HttpService } from '@nestjs/axios';
import { Logger, Module, type OnModuleInit } from '@nestjs/common';
import { VTPassService } from './vtpass.service';
import { ConfigService } from '@nestjs/config';
import type { Config } from 'src/config/configuration';

// HttpModule.register({}) ensures that the interceptors are registered only fot this module
@Module({
  imports: [HttpModule.register({})],
  providers: [VTPassService],
  exports: [VTPassService],
})
export class VTPassModule implements OnModuleInit {
  private readonly logger = new Logger(VTPassModule.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService<Config>,
  ) {}
  onModuleInit() {
    if ((VTPassModule as any).interceptorsRegistered) return;
    (VTPassModule as any).interceptorsRegistered = true;

    const axios = this.httpService.axiosRef;
    // Request interceptor: inject headers
    axios.interceptors.request.use(
      async (config) => {
        if (config.headers?.skipAuth) return config; // bypass

        config.headers = config.headers || {};
        config.headers['API-KEY'] = this.config.get('vtpassApikey');

        if (config.method?.toUpperCase() === 'GET') {
          config.headers['PUBLIC-KEY'] = this.config.get('vtpassPublicKey');
        }

        if (config.method?.toUpperCase() === 'POST') {
          config.headers['SECRET-KEY'] = this.config.get('vtpassSecretKey');
        }

        this.logger.debug(`${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error', error.message);
        return Promise.reject(error);
      },
    );
  }
}
