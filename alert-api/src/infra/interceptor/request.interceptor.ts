import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { get } from 'lodash';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { originalUrl, method, params, headers, body, query } = request;
    const begin = Date.now();
    const status = get(request, 'res.statusCode');
    const tags = ['http'];

    return next.handle().pipe(
      tap((response) => {
        console.log({
          requestInfo: {
            tags,
            originalUrl,
            method,
            params,
            body,
            query,
          },
        });
      }),
      catchError(async (error) => {
        console.error(error);
      }),
    );
  }
}
