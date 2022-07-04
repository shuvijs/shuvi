import { getRoutes } from '@shuvi/app/core/platform';
import {
  Application,
  getStoreManager,
  getErrorHandler,
  IAppState,
  IAppData,
  IRawPageRouteRecord
} from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import {
  createRouter,
  History,
  createBrowserHistory,
  createHashHistory
} from '@shuvi/router';
import { historyMode } from '@shuvi/app/files/routerConfig';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { getLoaderManager, getLoadersAndPreloadHook } from '../loader';

let app: Application;

export function createApp<AppState extends IAppState>(options: {
  routes: IRawPageRouteRecord[];
  appComponent: any;
  userComponents: any;
  appData: IAppData<any, AppState>;
}) {
  // app is a singleton in client side
  if (app) {
    return app;
  }

  const { routes, appData, appComponent, userComponents } = options;
  const { loadersData = {}, appState } = appData;
  const storeManager = getStoreManager(appState);
  let history: History;
  if (historyMode === 'hash') {
    history = createHashHistory();
  } else {
    history = createBrowserHistory();
  }

  // loaderManager is created here and will be cached.
  getLoaderManager(loadersData, appData.ssr);

  const router = createRouter({
    history,
    routes: getRoutes(routes)
  });
  router.beforeResolve(
    getLoadersAndPreloadHook(storeManager, {
      getAppContext: () => app.context
    })
  );
  router.afterEach(_current => {
    const error = getErrorHandler(storeManager);
    if (!_current.matches.length) {
      error.errorHandler(SHUVI_ERROR_CODE.PAGE_NOT_FOUND);
    } else {
      error.resetErrorState();
    }
  });

  app = application({
    AppComponent: appComponent,
    UserAppComponent: userComponents,
    router,
    storeManager
  });

  router.init();

  return app;
}
