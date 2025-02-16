import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse()['message'] || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `Error: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
