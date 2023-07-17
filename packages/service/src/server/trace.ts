import {
  SERVER_CREATE_APP,
  SERVER_REQUEST
} from '@shuvi/shared/constants/trace';
import { IRequest } from './http-server/serverTypes';
import { trace } from '../trace';

export function initTrace(req: IRequest) {
  const context = {
    req
  };
  const serverCreateAppTrace = trace(
    SERVER_CREATE_APP.name,
    undefined,
    undefined,
    context
  );
  const serverRequestTrace = trace(
    SERVER_REQUEST.name,
    undefined,
    undefined,
    context
  );
  return {
    serverCreateAppTrace,
    serverRequestTrace
  };
}
