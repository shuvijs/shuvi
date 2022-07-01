import { getRoutes } from '@shuvi/app/core/platform';
import {
  Application,
  getModelManager,
  getErrorHandler,
  IAppState,
  IAppData,
  IAppContext,
  IRawPageRouteRecord
} from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import {
  createRouter,
  History,
  createBrowserHistory,
  createHashHistory
} from '@shuvi/router';
import { historyMode, loaderOptions } from '@shuvi/app/files/routerConfig';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { getLoaderManager } from '../react/loader/loaderManager';
import { getLoadersHook } from '../react/utils/router';

let app: Application<IAppContext>;

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
  const modelManager = getModelManager(appState);
  let history: History;
  if (historyMode === 'hash') {
    history = createHashHistory();
  } else {
    history = createBrowserHistory();
  }

  const context = {};

  // loaderManager is created here and will be cached.
  getLoaderManager(loadersData, appData.ssr);

  const router = createRouter({
    history,
    routes: getRoutes(routes)
  });
  router.beforeResolve(getLoadersHook(context, loaderOptions, modelManager));
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
  router.init();

  app = application({
    AppComponent: appComponent,
    UserAppComponent: userComponents,
    router,
    context,
    modelManager
  });
  return app;
}
