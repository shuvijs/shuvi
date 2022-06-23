import UserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import {
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import {
  Application,
  getModelManager,
  getErrorHandler,
  IAppState,
  IAppData,
  IAppContext
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
  appData: IAppData<any, AppState>;
}) {
  // app is a singleton in client side
  if (app) {
    return app;
  }

  const { appData } = options;
  const { loadersData = {}, appState, routeProps } = appData;
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
    routes: getRoutes(routes, context, { routeProps })
  });
  router.afterEach(_current => {
    if (!_current.matches) {
      getErrorHandler(modelManager).errorHandler(
        SHUVI_ERROR_CODE.PAGE_NOT_FOUND
      );
    }
  });
  router.beforeResolve(getLoadersHook(context, loaderOptions));
  router.init();

  app = application({
    AppComponent: PlatformAppComponent,
    router,
    context,
    modelManager,
    UserAppComponent
  });
  return app;
}
