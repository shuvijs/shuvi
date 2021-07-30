import { IncomingMessage, ServerResponse } from 'http';
import { ParsedQuery, IParams } from '@shuvi/router';

export interface IRequest extends IncomingMessage {
  url: string;
  pathname: string;
  query: ParsedQuery;
  params: IParams;
}

export interface IResponse extends ServerResponse {}

export type IRequestHandler = (req: IRequest, res: ServerResponse) => void;

export interface IApiRouteConfig {
  path: string;
  handler: IRequestHandler;
}
