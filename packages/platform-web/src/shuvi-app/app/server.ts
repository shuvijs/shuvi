import routes from '@shuvi/app/files/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  isResponse,
  isRedirect,
  getLoaderManager
} from '@shuvi/platform-shared/shared';
import pageLoaders from '@shuvi/app/files/page-loaders';
import application, {
  Application
} from '@shuvi/platform-shared/shuvi-app/application';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';
import { CreateAppServer } from '../../shared';
import { ACTIVATE_PAGE_PATH } from '@shuvi/shared/lib/constants';
import * as http from 'http';

async function activatePage({
  url = '',
  acceptType = ['*/*', 'text/html']
}: {
  url: string;
  acceptType: Array<string>;
}): Promise<{
  success: boolean;
  message: any;
}> {
  const makeRequest = (_url: string): Promise<http.IncomingMessage> => {
    return new Promise((resolve, reject) => {
      const options = new URL(_url);
      const request = http.request(options);
      request.setHeader('accept', acceptType);
      request.on('response', res => resolve(res));
      request.on('error', err => reject(err));
      request.end();
    });
  };

  let success: boolean;
  let message: any;
  try {
    await makeRequest(url);
    success = true;
  } catch (e) {
    success = false;
    message = e;
  }

  return {
    success,
    message
  };
}

export const createApp: CreateAppServer = options => {
  const { req, ssr } = options;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });
  const router = createRouter({
    history,
    routes: getRoutes(routes)
  }) as IRouter;
  let app: Application;
  const loaderManager = getLoaderManager();

  if (ssr) {
    router.beforeResolve(async (to, from, next) => {
      if (to.pathname.startsWith(ACTIVATE_PAGE_PATH)) return next();
      const acceptType = req.headers.accept?.split(',') || [];
      const url = `http://${req.headers.host}${ACTIVATE_PAGE_PATH}?path=${to.pathname}`;
      await activatePage({
        url,
        acceptType
      });
      const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
      try {
        const loaderResult = await runLoaders(matches, pageLoaders, {
          isServer: true,
          req,
          query: to.query,
          getAppContext: () => app.context
        });
        loaderManager.setDatas(loaderResult);
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
          message: error.message || 'Loader Error'
        });
        next();
        return;
      }

      next();
    });
  }

  app = application({
    AppComponent,
    router
  });

  return app;
};
