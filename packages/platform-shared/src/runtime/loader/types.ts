import { IURLQuery, IURLParams } from '../routerTypes';
import { IAppContext, IRequest } from '../applicationTypes';
import { Response, error, redirect } from '../response';

export interface LoaderContextOptions {
  isServer: boolean;
  req?: IRequest;
  query: IURLQuery;
  getAppContext: () => IAppContext;
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
  redirect: typeof redirect;
  /**
   * throw error if necessary
   * ```ts
   * error(502, 'custom error describe')
   * ```
   */
  error: typeof error;
  /**
   * server only
   */
  req?: IRequest;
  /**
   * Application context object, which is accessiable during the entire lifecycle of application
   */
  appContext: IAppContext;
}

export type Loader<T extends {} = {}> = (
  loaderContenxt: IRouteLoaderContext
) => Promise<T | Response | void | undefined> | T | Response | void | undefined;

export type NormalizedLoader = (
  loaderContenxt: IRouteLoaderContext
) => Promise<Response | undefined>;

export type LoaderDataRecord = Record<string, any>;
