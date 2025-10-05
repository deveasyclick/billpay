import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getRequestContext } from './request-context.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const elapsed = Date.now() - start;
          const method = req.method;
          const url = req.url;
          const status = ctx.getResponse().statusCode;
          const requestId = getRequestContext('requestId');

          this.logger.log(
            `${method} ${url} ${status} — ${elapsed}ms — reqId=${requestId}`,
          );
        },
        error: (err) => {
          const elapsed = Date.now() - start;
          const method = req.method;
          const url = req.url;
          const status = ctx.getResponse().statusCode;
          const requestId = getRequestContext('requestId');

          this.logger.error(
            `Error on ${method} ${url} ${status} — ${elapsed}ms — reqId=${requestId} — ${err.message}`,
            err.stack,
          );
        },
      }),
    );
  }
}
