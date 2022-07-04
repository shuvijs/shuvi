import { getRoutes } from '@shuvi/app/core/platform';
import {
  Application,
  getModelManager,
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
  appData: IAppData<any, AppState>;
}) {
  // app is a singleton in client side
  if (app) {
    return app;
  }

  const { routes, appData, appComponent } = options;
  const { loadersData = {}, appState } = appData;
  const modelManager = getModelManager(appState);
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
    getLoadersAndPreloadHook(modelManager, {
      getAppContext: () => app.context
    })
  );
  router.afterEach(_current => {
    const error = getErrorHandler(modelManager);
    if (!_current.matches.length) {
      error.errorHandler(SHUVI_ERROR_CODE.PAGE_NOT_FOUND);
    } else {
      // FIXME
      setTimeout(() => {
        error.resetErrorState();
      }, 0);
    }
  });

  app = application({
    AppComponent: appComponent,
    router,
    modelManager
  });

  router.init();

  return app;
}
