import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { IParams, ParsedQuery } from '@shuvi/router';
import {
  IAppContext,
  IRequest,
  IRedirectState,
  IRedirectFn
} from '@shuvi/platform-shared/esm/runtime';

export type IURLQuery = ParsedQuery;
export type IURLParams = IParams;

export interface IRedirector {
  redirected: boolean;
  state?: IRedirectState;
  handler: IRedirectFn;
}

export type IErrorHandler = (
  errorCode?: SHUVI_ERROR_CODE | string,
  errorDesc?: string
) => void;

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
  redirect: IRedirectFn;
  /**
   * throw error if necessary
   * ```ts
   * error(502, 'custom error describe')
   * ```
   */
  error: IErrorHandler;
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
) => Promise<T | Response | void> | T | Response | void;

export type LoaderData<T = any> = {
  data: T | null;
  error?: Error | Error['message'];
  loading?: boolean;
};

export type LoadersData = Record<string, LoaderData>;
