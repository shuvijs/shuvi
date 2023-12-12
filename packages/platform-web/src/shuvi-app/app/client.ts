import { getRoutes } from '@shuvi/app/core/platform';
import {
  runPreload,
  runLoaders,
  createLoaderContext,
  getRouteMatchesWithInvalidLoader,
  isRedirect,
  isResponse,
  LoaderDataRecord
} from '@shuvi/platform-shared/shared';
import application from '@shuvi/platform-shared/shuvi-app/application';
import {
  createRouter,
  History,
  createBrowserHistory,
  createHashHistory
} from '@shuvi/router';
import { historyMode } from '@shuvi/app/files/routerConfig';
import { SHUVI_ERROR } from '@shuvi/shared/constants';
import { CLIENT_RENDER } from '@shuvi/shared/constants/trace';

import { InternalApplication, CreateAppClient } from '../../shared';
import isThirdSite from '../helper/isThirdSite';
import { clientRenderTrace } from '../entry/client/trace';

let app: InternalApplication;

export { InternalApplication };

const { SHUVI_CLIENT_RUN_LOADERS } = CLIENT_RENDER.events;
export const createApp: CreateAppClient = ({
  routes,
  appData,
  appComponent
}) => {
  // app is a singleton in client side
  if (app) {
    return app;
  }

  const { appState, ssr, basename } = appData;
  let history: History;
  if (historyMode === 'hash') {
    history = createHashHistory();
  } else {
    history = createBrowserHistory();
  }

  const router = createRouter({
    history,
    routes: getRoutes(routes),
    basename
  });

  app = application({
    initialState: appState,
    AppComponent: appComponent,
    router,
    config: { ssr }
  });

  const loadersData = app.getLoadersData();
  const hasHydrateData = Object.keys(loadersData).length > 0;
  let shouldHydrate = !!ssr;

  router.beforeResolve(async (to, from, next) => {
    // when hydrating, we will never run loaders, but just use the data from server
    if (shouldHydrate) {
      shouldHydrate = false;
      if (hasHydrateData) {
        app.setLoadersData(loadersData);
      }
      return next();
    }

    if (!to.matches.length) {
      app.setError(SHUVI_ERROR.PAGE_NOT_FOUND);
      next();
      return;
    }
    const runLoadersTrace = clientRenderTrace.traceChild(
      SHUVI_CLIENT_RUN_LOADERS.name
    );
    const pageLoaders = await app.getLoaders();
    const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);

    const loaderContext = createLoaderContext({
      pathname: to.pathname,
      query: to.query,
      params: to.params,
      getAppContext: () => app.context
    });
    try {
      const loaderDatas = await new Promise<LoaderDataRecord>(
        (resolve, reject) => {
          let value: LoaderDataRecord;
          let error: any;
          let requireNum = 2;
          let resolvedNum = 0;

          const tryResolve = () => {
            if (++resolvedNum === requireNum) {
              if (error) {
                reject(error);
              } else {
                resolve(value);
              }
            }
          };
          // if preload has error, reject directly
          runPreload(to)
            .then(tryResolve)
            .catch(err => {
              reject(err);
            });
          runLoaders(matches, pageLoaders, loaderContext)
            .then(_value => {
              value = _value;
              tryResolve();
            })
            .catch(err => {
              error = err;
              tryResolve();
            });
        }
      );
      app.setLoadersData(loaderDatas);
      runLoadersTrace.setAttribute(
        SHUVI_CLIENT_RUN_LOADERS.attrs.error.name,
        false
      );
      runLoadersTrace.stop();
    } catch (error: any) {
      runLoadersTrace.setAttribute(
        SHUVI_CLIENT_RUN_LOADERS.attrs.error.name,
        true
      );
      if (isRedirect(error)) {
        const location = error.headers.get('Location')!;
        if (isThirdSite(location)) {
          window.location.replace(location);
        } else {
          next(location);
        }
        runLoadersTrace.setAttribute(
          SHUVI_CLIENT_RUN_LOADERS.attrs.errorType.name,
          'redirect'
        );
        runLoadersTrace.stop();
        return;
      }

      if (isResponse(error) && error.status >= 400 && error.status < 600) {
        // client error has no status code
        app.setError({
          message: error.data
        });
        next();
        runLoadersTrace.setAttribute(
          SHUVI_CLIENT_RUN_LOADERS.attrs.errorType.name,
          'userError'
        );
        runLoadersTrace.stop();
        return;
      }
      runLoadersTrace.setAttribute(
        SHUVI_CLIENT_RUN_LOADERS.attrs.errorType.name,
        'unexpectedError'
      );
      runLoadersTrace.stop();
      // If loader throws a error, we need to rethrow it
      app.setError({
        message: SHUVI_ERROR.CLIENT_ERROR.message,
        error
      });
      // to trigger error-overlay at dev
      next(() => {
        throw error;
      });
      return;
    }

    next(() => {
      app.clearError();
    });
  });

  return app;
};
