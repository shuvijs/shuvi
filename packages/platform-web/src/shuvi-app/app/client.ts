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
import pageLoaders from '@shuvi/app/files/page-loaders';
import { historyMode } from '@shuvi/app/files/routerConfig';
import { SHUVI_ERROR } from '@shuvi/shared/lib/constants';
import { InternalApplication, CreateAppClient } from '../../shared';
import { serializeServerError } from '../helper/serializeServerError';
import isThirdSite from '../helper/isThirdSite';

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
      app.setLoadersData(loaderDatas);
    } catch (error: any) {
      if (isRedirect(error)) {
        const location = error.headers.get('Location')!;
        if (isThirdSite(location)) {
          window.location.replace(location);
        } else {
          next(location);
        }
        return;
      }

      if (isResponse(error) && error.status >= 400 && error.status < 600) {
        app.setError({
          code: error.status,
          message: error.data
        });
        next();
        return;
      }

      app.setError(serializeServerError(error));
      next();
      return;
    }

    next(() => {
      app.clearError();
    });
  });

  return app;
};
