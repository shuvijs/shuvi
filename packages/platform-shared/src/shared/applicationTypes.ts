import { Doura } from 'doura';
import { CustomAppContext } from '@shuvi/runtime';
import type { ShuviRequest } from '@shuvi/service';
import { IRouter } from './routerTypes';
import { IPluginList } from './runtimPlugin';
import { Loader } from './loader';

export type Loaders = Record<string, Loader>;

export interface IAppContext extends CustomAppContext {
  [x: string]: any;
}

export type IRerenderConfig = {
  AppComponent?: any;
};

export type { Doura };

export type ErrorSource = 'server';

export interface IError {
  code?: number;
  message?: string;
  source?: ErrorSource;
  error?: Error;
  fatal?: boolean;
}

export interface IErrorState {
  error: IError | null;
}

export type IAppState = {
  error: IErrorState;
};

export interface Application<Config extends {} = {}> {
  readonly config: Config;
  readonly context: IAppContext;
  readonly router: IRouter;
  readonly appComponent: any;
  readonly store: Doura;
  readonly error: IErrorState['error'];
  setError(err: IError): void;
  clearError(): void;
  getLoadersData(): Record<string, any>;
  setLoadersData(datas: Record<string, any>): void;
}

export interface GetLoadersFn {
  (): Promise<Record<string, Loader>>;
}

export interface ApplicationInternalOptions<C extends {}> {
  config: C;
  router: IRouter;
  AppComponent: any;
  getLoaders: GetLoadersFn;
  initialState?: IAppState;
  plugins?: IPluginList;
  request?: ShuviRequest;
}

export type ApplicationlOptions<C extends {}> = Omit<
  ApplicationInternalOptions<C>,
  'getLoaders' | 'plugins'
>;
