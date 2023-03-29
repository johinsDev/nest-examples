import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { mongo } from 'mongoose';

class ConflictException extends HttpException {
  constructor(message: string) {
    super(message, 409);
  }
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    try {
      if (exception instanceof mongo.MongoError) {
        const e = exception as mongo.MongoError;

        switch (exception.code) {
          case 11000: {
            const message = e.message;

            const key = message.split('dup key: { ')[1].split('"')[0];

            throw new ConflictException(`Duplicate unique key '${key}'`);
          }
        }
      }
    } catch (error) {
      const e = error as HttpException;
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      response.status(e.getStatus()).json({
        statusCode: e.getStatus(),
        timestamp: new Date().toISOString(),
        message: error.message,
      });
    }

    super.catch(exception, host);
  }
}

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

//   catch(exception: unknown, host: ArgumentsHost): void {
//     // In certain situations `httpAdapter` might not be available in the
//     // constructor method, thus we should resolve it here.
//     const { httpAdapter } = this.httpAdapterHost;

//     const ctx = host.switchToHttp();

//     const httpStatus =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     const responseBody = {
//       statusCode: httpStatus,
//       timestamp: new Date().toISOString(),
//       path: httpAdapter.getRequestUrl(ctx.getRequest()),
//     };

//     httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
//   }
// }
