import {
  SERVER_CREATE_APP,
  SERVER_REQUEST
} from '@shuvi/shared/constants/trace';
import { trace } from '../trace';

export const serverCreateAppTrace = trace(SERVER_CREATE_APP.name);
export const serverRequestTrace = trace(SERVER_REQUEST.name);
