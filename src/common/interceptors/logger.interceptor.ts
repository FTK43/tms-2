import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;

    const now = Date.now();

    console.log(`[REQ] ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        console.log(`[RES] ${method} ${url} - ${ms}ms`);
      }),
    );
  }
}
