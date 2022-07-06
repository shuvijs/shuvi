import { getRoutes } from '@shuvi/app/core/platform';
import {
  Application,
  IAppState,
  IAppData,
  IRawPageRouteRecord,
  runPreload,
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  getLoaderManager,
  isRedirect,
  isError
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
import { SHUVI_ERROR } from '@shuvi/shared/lib/constants';

let app: Application;

export function createApp(options: {
  routes: IRawPageRouteRecord[];
  appComponent: any;
  appData: IAppData<any, IAppState>;
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

  app = application({
    initialState: appState,
    AppComponent: appComponent,
    router
  });

  const hasHydrateData = Object.keys(loadersData).length > 0;
  const loaderManager = getLoaderManager();
  let shouldHydrate = ssr && hasHydrateData;
  let hasServerError = app.error.hasError();

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
    const _runLoaders = async () => {
      return await runLoaders(matches, pageLoaders, {
        isServer: false,
        query: to.query,
        appContext: () => app.context
      });
    };
    const _preload = async () => {
      let preloadError;
      try {
        await runPreload(to);
      } catch (err) {
        preloadError = err;
      }
      return preloadError;
    };

    const [preloadError, loaderResult] = await Promise.all([
      _preload(),
      _runLoaders()
    ]);

    if (preloadError) {
      app.error.error();
      next();
      return;
    }

    if (isRedirect(loaderResult)) {
      next(loaderResult.headers.get('Location')!);
      return;
    }

    if (isError(loaderResult)) {
      app.error.error({
        code: loaderResult.status,
        message: loaderResult.data
      });
      next();
      return;
    }

    loaderManager.setDatas(loaderResult);

    next(() => {
      app.error.clear();
    });
  });

  return app;
}
