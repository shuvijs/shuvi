import { IncomingMessage, ServerResponse } from 'http';
import { ParsedQuery, IParams } from '@shuvi/router';

export interface IRequest extends IncomingMessage {
  url: string;
  pathname: string;
  query: ParsedQuery;
  params: IParams;
}

export interface IResponse extends ServerResponse {}

export interface IApiRouteConfig {
  path: string;
  children?: IApiRouteConfig[];
  apiModule: string;
}
