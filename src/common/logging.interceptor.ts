import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    const body = method === 'POST' || method === 'PUT' ? request.body : undefined;
    const bodyLog = body && Object.keys(body).length ? ` body=${JSON.stringify(body)}` : '';

    this.logger.log(`--> ${method} ${url}${bodyLog}`);

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const duration = Date.now() - now;
          const response = context.switchToHttp().getResponse();
          this.logger.log(`<-- ${method} ${url} ${response.statusCode} ${duration}ms`);
        },
        error: (error: any) => {
          const duration = Date.now() - now;
          this.logger.error(`<-- ${method} ${url} ${error.status || 500} ${duration}ms - ${error.message}`);
        },
      }),
    );
  }
}