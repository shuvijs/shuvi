import UserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import {
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import {
  IApplication,
  getModelManager,
  getErrorModel,
  IAppRenderFn,
  IClientAppContext,
  IAppData,
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
import { historyMode } from '@shuvi/app/files/routerConfig';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';

let app: IApplication;

export function createClientApp<CompType>(options: {
  render: IAppRenderFn<IClientAppContext, CompType>;
  appData: IAppData<any>;
}) {
  // app is a singleton in client side
  if (app) {
    return app;
  }

  const { appData } = options;
  const { appState } = appData;
  const modelManager = getModelManager(appState);
  let history: History;
  if (historyMode === 'hash') {
    history = createHashHistory();
  } else {
    history = createBrowserHistory();
  }

  const errorModel = getErrorModel(modelManager);
  const router = createRouter({
    history,
    routes: getRoutes(routes)
  });
  app = application({
    AppComponent: PlatformAppComponent,
    router,
    modelManager,
    render: options.render,
    UserAppComponent
  });

  router.afterEach(_current => {
    if (!_current.matches) {
      getErrorModel(modelManager).error(SHUVI_ERROR_CODE.PAGE_NOT_FOUND);
    }
  });
  router.beforeResolve(async (to, from, next) => {
    const resp = await app.runLoaders(to, from);

    if (resp) {
      if (isRedirect(resp)) {
        const href = resp.headers.get('Location')!;
        app.router.push(href);
        return;
      }

      if (isError(resp)) {
        errorModel.error(resp.status, resp.body);
        next();
        return;
      }
    }

    errorModel.reset();
    next();
  });
  router.init();

  return app;
}
