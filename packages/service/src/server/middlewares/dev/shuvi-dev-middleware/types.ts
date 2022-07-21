import { statSync, readFileSync } from 'fs';
import type {
  Compiler,
  MultiCompiler,
  MultiStats,
  Stats
} from '@shuvi/toolpack/lib/webpack';

import {
  IRequest,
  IResponse,
  IRequestHandlerWithNext
} from '../../../http-server/serverTypes';

export {
  MultiCompiler,
  MultiStats,
  Stats,
  IRequest,
  IResponse,
  IRequestHandlerWithNext
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
  outputFileSystem:
    | (Compiler['outputFileSystem'] & {
        statSync: typeof statSync;
        readFileSync: typeof readFileSync;
      })
    | undefined;
}

export interface IShuviDevMiddleware {
  waitUntilValid(callback?: ICallback): void;
  invalidate(callback?: ICallback): void;
  context?: IContext;
}
