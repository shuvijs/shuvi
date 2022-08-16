import type { ShuviRequest } from '@shuvi/service';
import { IURLQuery, IURLParams } from '../routerTypes';
import { IAppContext } from '../applicationTypes';
import { Response } from '../response';

export interface LoaderContextOptions {
  isServer: boolean;
  req?: ShuviRequest;
  query: IURLQuery;
  getAppContext: () => IAppContext;
}

export type RedirectFunction = (to: string, status?: number) => any;

export interface ErrorFunction {
  (): any;
  (msg: string): any;
  (msg: string, statusCode?: number): any;
}

/**
 * route component getInitialProps params `context`
 */
export interface IRouteLoaderContext {
  /**
   * is running on server, if server is true, client will be false
   */
  isServer: boolean;
  /**
   * current url path
   */
  pathname: string;
  /**
   * the query string of current url
   *
   * eg. url /x?name=xx
   * ```ts
   * {name:xx}
   * ```
   */
  query: IURLQuery;
  /**
   * the params of current url
   *
   * eg. url /x?name=xx path /:lng
   * ```ts
   * {lng:x}
   * ```
   */
  params: IURLParams;
  /**
   * redirect function
   *
   * ```ts
   * redirect('/target')
   * redirect('/target', 301)
   * ```
   */
  redirect: RedirectFunction;
  /**
   * throw error if necessary
   * ```ts
   * error('custom error describe', 502)
   * ```
   */
  error: ErrorFunction;
  /**
   * server only
   */
  req?: ShuviRequest;
  /**
   * Application context object, which is accessiable during the entire lifecycle of application
   */
  appContext: IAppContext;
}

export type Loader<T extends {} = {}> = (
  loaderContenxt: IRouteLoaderContext
) => Promise<T | void | undefined> | T | void | undefined;

export type NormalizedLoader = (
  loaderContenxt: IRouteLoaderContext
) => Promise<Response | undefined>;

export type LoaderDataRecord = Record<string, any>;
