import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ValidationError } from 'class-validator';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorName = 'InternalServerError';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      errorName = exception.name;

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as any;

        if (res.errors && !Array.isArray(res.errors)) {
          errors = res.errors;
          message = res.message || 'Validation failed';
        } else if (
          status === HttpStatus.BAD_REQUEST &&
          Array.isArray(res.message) &&
          typeof res.message[0] === 'object'
        ) {
          errors = this.formatValidationErrors(res.message);
          message = 'Validation failed';
        } else {
          message = Array.isArray(res.message)
            ? res.message[0]
            : res.message || exception.message;
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.constructor.name;
    }

    response.status(status).json({
      errorName,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private formatValidationErrors(
    validationErrors: ValidationError[],
  ): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    validationErrors.forEach((error) => {
      const property = error.property;
      const constraints = error.constraints;
      if (constraints) {
        result[property] = Object.values(constraints);
      }
    });

    return result;
  }
}
