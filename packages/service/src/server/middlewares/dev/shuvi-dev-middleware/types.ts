import { IncomingMessage, ServerResponse } from 'http';
import type {
  MultiCompiler,
  MultiStats,
  Stats
} from '@shuvi/toolpack/lib/webpack';

import { INextFunc } from '../../../http-server/serverTypes';

export {
  MultiCompiler,
  MultiStats,
  Stats,
  IncomingMessage,
  ServerResponse,
  INextFunc
};

export type ICallback = (stats?: MultiStats | Stats) => void;

export type MultiWatching = ReturnType<MultiCompiler['watch']>;

export interface IOptions {
  publicPath: string;
}

export interface IContext {
  state: boolean;
  stats: MultiStats | Stats | undefined; //Stats for done tap
  callbacks: ICallback[];
  options: IOptions;
  compiler: MultiCompiler;
  watching: MultiWatching | undefined;
}

export interface IShuviDevMiddleware {
  waitUntilValid(callback?: ICallback, force?: boolean): void;
  invalidate(callback?: ICallback): void;
  context?: IContext;
}

export type IHandlerWithNext = (
  req: IncomingMessage,
  res: ServerResponse,
  next: INextFunc
) => void;
