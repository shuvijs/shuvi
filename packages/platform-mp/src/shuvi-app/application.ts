import AppComponent from '@shuvi/app/core/app';
import { Application, getAppStore, IAppState } from '@shuvi/platform-core';
import runPlugins from '@shuvi/platform-core/lib/runPlugins';
import { IRouter } from '@shuvi/router';
import { IAppRenderFn } from '@shuvi/runtime-core';
import { Store } from '@shuvi/shared/lib/miniRedux';

export function create<
  Context extends { req: any },
  Router extends IRouter<any>,
  AppState extends IAppState
>(
  context: Context,
  options: {
    render: IAppRenderFn<Context, never, Store>;
    appState?: AppState;
  }
) {
  const appStore = getAppStore();
  const router = undefined;
  const app = new Application({
    AppComponent,
    context,
    router: router as never,
    appStore,
    render: options.render
  });
  runPlugins(app);
  return app;
}
