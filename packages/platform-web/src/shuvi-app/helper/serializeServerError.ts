// @ts-ignore
import stripAnsi from 'strip-ansi';
import { IError } from '@shuvi/platform-shared/shared';
import { SHUVI_ERROR } from '@shuvi/shared/constants';

function errorToJSON(err: Error): IError {
  return {
    code: 500,
    message: stripAnsi(err.message),
    source: 'server',
    error: {
      name: err.name,
      stack: err.stack,
      message: err.message
    }
  };
}

export function serializeServerError(err: Error): IError {
  if (process.env.NODE_ENV === 'development') {
    return errorToJSON(err);
  }

  return {
    code: 500,
    message: SHUVI_ERROR.SERVER_ERROR.message
  };
}
