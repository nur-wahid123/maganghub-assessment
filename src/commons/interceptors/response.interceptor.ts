import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { version } from '../../../package.json';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.switchToHttp().getResponse().statusCode === 200) {
      return next.handle().pipe(
        map((data) => {
          if (data) {
            if (data instanceof StreamableFile) {
              return data;
            }
            if (data instanceof Buffer) {
              return data;
            } else if (data?.data) {
              return {
                code: 200,
                version,
                message: 'success',
                data: data.data,
                pagination: data.pagination,
              };
            } else {
              return {
                code: 200,
                version,
                message: 'success',
                data,
              };
            }
          } else {
            return next.handle();
          }
        }),
      );
    }

    return next.handle().pipe(
      map((data) => ({
        code: 201,
        version,
        message: 'created',
        data,
      })),
    );
  }
}
