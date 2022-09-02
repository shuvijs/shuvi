// @ts-ignore
import stripAnsi from 'strip-ansi';
import { IError } from '@shuvi/platform-shared/shared';

function errorToJSON(err: Error): IError {
  return {
    code: 500,
    message: stripAnsi(err.message),
    name: err.name,
    source: 'server',
    stack: err.stack
  };
}

export function serializeServerError(err: Error): IError {
  if (process.env.NODE_ENV === 'development') {
    return errorToJSON(err);
  }

  return {
    code: 500,
    message: 'Internal Server Error',
    name: 'Internal Server Error'
  };
}
