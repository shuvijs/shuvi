import { getRoutes } from '@shuvi/app/core/platform';
import {
  runPreload,
  runLoaders,
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
import { InternalApplication, CreateAppClient } from '../../shared';
import isThirdSite from '../helper/isThirdSite';
import { clientRenderTrace } from '../entry/client/trace';

let app: InternalApplication;

export { InternalApplication };

export const createApp: CreateAppClient = ({
  routes,
  appData,
  appComponent
}) => {
  // app is a singleton in client side
  if (app) {
    return app;
  }

  const { appState, ssr } = appData;
  let history: History;
  if (historyMode === 'hash') {
    history = createHashHistory();
  } else {
    history = createBrowserHistory();
  }

  const router = createRouter({
    history,
    routes: getRoutes(routes)
  });

  app = application({
    initialState: appState,
    AppComponent: appComponent,
    router,
    config: { ssr }
  });

  const loadersData = app.getLoadersData();
  const hasHydrateData = Object.keys(loadersData).length > 0;
  let shouldHydrate = ssr && hasHydrateData;
  let hasServerError = !!app.error;

  router.beforeResolve(async (to, from, next) => {
    if (shouldHydrate) {
      shouldHydrate = false;
      app.setLoadersData(loadersData);
      return next();
    }

    if (hasServerError) {
      hasServerError = false;
      return next();
    }

    if (!to.matches.length) {
      app.setError(SHUVI_ERROR.PAGE_NOT_FOUND);
      next();
      return;
    }
    const runLoadersTrace = clientRenderTrace.traceChild(
      'SHUVI_CLIENT_RUN_LOADERS'
    );
    const pageLoaders = await app.getLoaders();
    const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);

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
          runLoaders(matches, pageLoaders, {
            pathname: to.pathname,
            query: to.query,
            params: to.params,
            getAppContext: () => app.context
          })
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
      console.log('runLoaders end', performance.now());
      runLoadersTrace.setAttribute('error', false);
      runLoadersTrace.stop();
    } catch (error: any) {
      runLoadersTrace.setAttribute('error', true);
      if (isRedirect(error)) {
        const location = error.headers.get('Location')!;
        if (isThirdSite(location)) {
          window.location.replace(location);
        } else {
          next({
            path: location,
            replace: true
          });
        }
        runLoadersTrace.setAttribute('errorType', 'redirect');
        runLoadersTrace.stop();
        return;
      }

      if (isResponse(error) && error.status >= 400 && error.status < 600) {
        // client error has no status code
        app.setError({
          message: error.data
        });
        next();
        runLoadersTrace.setAttribute('errorType', 'userError');
        runLoadersTrace.stop();
        return;
      }

      // If loader throws a error, we need to rethrow it
      app.setError({
        message: SHUVI_ERROR.CLIENT_ERROR.message,
        error
      });
      // to trigger error-overlay at dev
      next(() => {
        throw error;
      });
      runLoadersTrace.setAttribute('errorType', 'unexpectedError');
      runLoadersTrace.stop();
      return;
    }

    next(() => {
      app.clearError();
    });
  });

  return app;
};
