import { getRoutes } from '@shuvi/app/core/platform';
import {
  runPreload,
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  getLoaderManager,
  isRedirect,
  isResponse,
  LoaderDataRecord
} from '@shuvi/platform-shared/shared';
import application, {
  Application
} from '@shuvi/platform-shared/shuvi-app/application';
import {
  createRouter,
  History,
  createBrowserHistory,
  createHashHistory
} from '@shuvi/router';
import pageLoaders from '@shuvi/app/files/page-loaders';
import { historyMode } from '@shuvi/app/files/routerConfig';
import { SHUVI_ERROR } from '@shuvi/shared/lib/constants';
import { CreateAppClient } from '../../shared';

let app: Application;

export { Application };

export const createApp: CreateAppClient = ({
  routes,
  appData,
  appComponent
}) => {
  // app is a singleton in client side
  if (app) {
    return app;
  }

  const { loadersData = {}, appState, ssr } = appData;
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
    router
  });

  const hasHydrateData = Object.keys(loadersData).length > 0;
  const loaderManager = getLoaderManager();
  let shouldHydrate = ssr && hasHydrateData;
  let hasServerError = app.error.hasError;

  router.beforeResolve(async (to, from, next) => {
    if (shouldHydrate) {
      shouldHydrate = false;
      loaderManager.setDatas(loadersData);
      return next();
    }

    if (hasServerError) {
      hasServerError = false;
      return next();
    }

    if (!to.matches.length) {
      app.error.error(SHUVI_ERROR.PAGE_NOT_FOUND);
      next();
      return;
    }

    const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
    let isPreloadError = false;
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
              isPreloadError = true;
              reject(err);
            });

          runLoaders(matches, pageLoaders, {
            isServer: false,
            query: to.query,
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
      loaderManager.setDatas(loaderDatas);
    } catch (error: any) {
      if (isRedirect(error)) {
        next(error.headers.get('Location')!);
        return;
      }

      if (isResponse(error) && error.status >= 400 && error.status < 600) {
        app.error.error({
          code: error.status,
          message: error.data
        });
        next();
        return;
      }

      app.error.error({
        code: SHUVI_ERROR.APP_ERROR.code,
        message:
          error.message || isPreloadError ? 'Preload Error' : 'Loader Error'
      });
      next();
      return;
    }

    next(() => {
      app.error.clear();
    });
  });

  return app;
};
