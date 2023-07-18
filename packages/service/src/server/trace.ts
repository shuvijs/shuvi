import {
  SERVER_CREATE_APP,
  SERVER_REQUEST
} from '@shuvi/shared/constants/trace';
import { trace } from '../trace';

export function initTrace(requestId: string) {
  const serverCreateAppTrace = trace(SERVER_CREATE_APP.name);
  serverCreateAppTrace.setAttribute(
    SERVER_CREATE_APP.attrs.requestId,
    requestId
  );

  const serverRequestTrace = trace(SERVER_REQUEST.name);
  serverRequestTrace.setAttribute(SERVER_REQUEST.attrs.requestId, requestId);

  return {
    serverCreateAppTrace,
    serverRequestTrace
  };
}
