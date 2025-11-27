import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    this.logger.error(
      `Error on ${request.method} ${request.url}`,
      (exception as any)?.stack || String(exception),
    );

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message: this.normalizeMsg(exceptionResponse),
      error: this.extractErrorCode(exceptionResponse),
    };

    response.status(status).json(errorResponse);
  }

  private normalizeMsg(exceptionResponse: unknown) {
    if (typeof exceptionResponse === 'string') {
      return [exceptionResponse];
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const msg = exceptionResponse.message;
      if (Array.isArray(msg)) {
        return msg;
      }
      if (typeof msg === 'string') {
        return [msg];
      }
    }

    return ['Internal server error'];
  }

  private extractErrorCode(exceptionResponse: unknown) {
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'error' in exceptionResponse
    ) {
      return String(exceptionResponse.error);
    }
    return null;
  }
}
