import {
  IRedirectState,
  IRedirectFn,
  IURLQuery,
  IURLParams
} from '../routerTypes';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { getModelManager } from '../store/getModelsManager';
import { errorModel, IPageError } from '../store/models';
import { IAppContext } from '../applicationTypes';

export interface IRedirector {
  redirected: boolean;
  state?: IRedirectState;
  handler: IRedirectFn;
}

export type IErrorHandler = (
  errorCode?: SHUVI_ERROR_CODE | string,
  errorDesc?: string
) => void;

export interface IPageErrorHandler extends IPageError {
  handler: IErrorHandler;
}

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
   * redirect(301, '/target')
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
   * Application context object, which accompanies the entire application life cycle
   * {@link IClientAppContext} for client
   * {@link IServerAppContext} for server
   */
  appContext: UserAppContext;
}

/**
 * app component getInitialProps params `context`
 */
export interface IAppGetInitoalPropsContext extends IRouteLoaderContext {
  fetchInitialProps(): Promise<void>;
}

// todo: remove createRedirector from router
export function createRedirector(): IRedirector {
  const redirector = {
    redirected: false,
    state: undefined
  } as IRedirector;

  redirector.handler = (first?: number | string, second?: string) => {
    if (redirector.redirected) {
      return;
    }

    if (!first) {
      return;
    }

    let firstType = typeof first;
    let secondType = typeof second;
    if (firstType === 'number' && secondType === 'string') {
      redirector.redirected = true;
      redirector.state = {
        status: first as number,
        path: second as string
      };
    } else if (firstType === 'string' && secondType === 'undefined') {
      redirector.redirected = true;
      redirector.state = {
        path: first as string
      };
    }
  };

  return redirector;
}

export function createError(): IPageErrorHandler {
  const pageError = {
    errorCode: undefined,
    errorDesc: undefined
  } as unknown as IPageErrorHandler;

  pageError.handler = (
    errorCode?: SHUVI_ERROR_CODE | string,
    errorDesc?: string
  ) => {
    if (pageError.errorCode !== undefined) {
      return pageError;
    }
    if (typeof errorCode === 'number') {
      pageError.errorCode = errorCode;
      pageError.errorDesc = errorDesc;
    } else {
      pageError.errorCode = SHUVI_ERROR_CODE.APP_ERROR;
      pageError.errorDesc = errorCode;
    }
    return pageError;
  };

  return pageError;
}

export function getErrorHandler(
  modelManager: ReturnType<typeof getModelManager>
): {
  errorHandler: IErrorHandler;
  reset: () => void;
} {
  return {
    errorHandler(errorCode?: SHUVI_ERROR_CODE | string, errorDesc?: string) {
      const errorStore = modelManager.get(errorModel);
      const payload = {
        hasError: true
      } as IPageError;
      if (typeof errorCode === 'number') {
        payload.errorCode = errorCode;
        payload.errorDesc = errorDesc;
      } else {
        payload.errorCode = SHUVI_ERROR_CODE.APP_ERROR;
        payload.errorDesc = errorCode;
      }
      errorStore.update(payload);
    },
    reset() {
      const errorStore = modelManager.get(errorModel);
      const { hasError } = errorStore.$state();
      if (!hasError) {
        return;
      }
      errorStore.reset();
    }
  };
}
