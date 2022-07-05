import { getRoutes } from '@shuvi/app/core/platform';
import {
  Application,
  getStoreManager,
  getErrorHandler,
  IAppState,
  IAppData,
  IRawPageRouteRecord,
  runPreload,
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  Response,
  getLoaderManager,
  isRedirect,
  isError,
  isResponse
} from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import {
  createRouter,
  History,
  createBrowserHistory,
  createHashHistory
} from '@shuvi/router';
import pageLoaders from '@shuvi/app/files/page-loaders';
import { historyMode } from '@shuvi/app/files/routerConfig';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';

let app: Application;

export function createApp<AppState extends IAppState>(options: {
  routes: IRawPageRouteRecord[];
  appComponent: any;
  appData: IAppData<any, AppState>;
}) {
  // app is a singleton in client side
  if (app) {
    return app;
  }

  const { routes, appData, appComponent } = options;
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
  const hasHydrateData = Object.keys(loadersData).length > 0;
  const loaderManager = getLoaderManager(loadersData);
  const storeManager = getStoreManager(appState);
  const error = getErrorHandler(storeManager);
  let shouldHydrate = ssr && hasHydrateData;
  let hasServerError = error.hasError();

  router.beforeResolve(async (to, from, next) => {
    if (shouldHydrate) {
      shouldHydrate = false;
      return next();
    }

    if (hasServerError) {
      hasServerError = false;
      return next();
    }

    if (!to.matches.length) {
      error.errorHandler({ code: SHUVI_ERROR_CODE.PAGE_NOT_FOUND });
      next();
      return;
    }

    const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
    let loaderDatas: (Response | undefined)[] = [];
    const _runLoaders = async () => {
      loaderDatas = await runLoaders(matches, pageLoaders, {
        isServer: false,
        query: to.query,
        getAppContext: () => app.context
      });
    };
    let preloadError;
    const _preload = async () => {
      try {
        await runPreload(to);
      } catch (err) {
        preloadError = err;
      }
    };

    await Promise.all([_preload(), _runLoaders()]);

    if (preloadError) {
      error.errorHandler();
      next();
      return;
    }

    for (let index = 0; index < loaderDatas.length; index++) {
      const data = loaderDatas[index];
      if (isRedirect(data)) {
        loaderManager.clearAllData();
        next(data.headers.get('Location')!);
        return;
      }

      if (isError(data)) {
        loaderManager.clearAllData();
        error.errorHandler({
          code: (data as Response).status,
          message: (data as Response).data
        });
        next();
        return;
      }

      if (isResponse(data)) {
        loaderManager.setData(matches[index].route.id, (data as Response).data);
      } else {
        loaderManager.setData(matches[index].route.id, undefined);
      }
    }

    next(() => {
      error.reset();
    });
  });

  app = application({
    AppComponent: appComponent,
    router,
    storeManager
  });

  router.init();

  return app;
}
