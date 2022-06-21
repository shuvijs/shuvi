import { IParams, ParsedQuery } from '@shuvi/router';
import { IAppContext, IRequest } from '../applicationTypes';
import { Response } from '../response';
import * as response from '../response';

export type IURLQuery = ParsedQuery;
export type IURLParams = IParams;

/**
 * route component getInitialProps params `context`
 */
export interface IRouteLoaderContext<UserAppContext extends IAppContext = {}> {
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
  redirect: typeof response.redirect;
  /**
   * throw error if necessary
   * ```ts
   * error(502, 'custom error describe')
   * ```
   */
  error: typeof response.error;
  /**
   * server only
   */
  req?: IRequest;
  /**
   * Application context object, which accompanies the entire application life cycle
   * {@link IClientUserContext} for client
   * {@link IServerUserContext} for server
   */
  appContext: UserAppContext;
}

export type ILoaderOptions = {
  sequential?: boolean;
};

export type LoaderFn<T extends {} = {}> = (
  loaderContenxt: IRouteLoaderContext
) => Promise<T | Response | void> | T | Response | void;

export type LoaderData<T = any> = {
  data: T | null;
  error?: Error | Error['message'];
  loading?: boolean;
};

export type LoadersData = Record<string, LoaderData>;
