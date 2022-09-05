import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AUTHENTICATION_FAILURE, BAD_REQUEST_FAILURE, FAILURE, Failure, MISSING_ARGUMENT_FAILURE, NETWORK_FAILURE, NOT_AUTHORIZED_FAILURE, NOT_FOUND_FAILURE, SERVER_FAILURE, VALIDATION_FAILURE } from 'src/models/app.models';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(failure: Failure, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = getHttpStatusFromFailure(Failure.parse(failure));
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        failure: {
          ...failure,
          message: failure.message
        }
      });
  }
}

function getHttpStatusFromFailure(failure: Failure) {
  switch (failure.type) {
    case AUTHENTICATION_FAILURE:
      return HttpStatus.UNAUTHORIZED;

    case NOT_FOUND_FAILURE:
      return HttpStatus.NOT_FOUND;

    case NOT_AUTHORIZED_FAILURE:
      return HttpStatus.UNAUTHORIZED;

    case MISSING_ARGUMENT_FAILURE:
    case BAD_REQUEST_FAILURE:
    case VALIDATION_FAILURE:
      return HttpStatus.BAD_REQUEST;
      
    case SERVER_FAILURE:
    case NETWORK_FAILURE:
    case FAILURE:
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}