import AppComponent from '@shuvi/app/core/app';
import { Application, IAppState, IAppRenderFn } from '@shuvi/platform-core';
import runPlugins from '@shuvi/platform-core/lib/runPlugins';
import { IRouter } from '@shuvi/router';

export function create<
  Context extends { req: any },
  Router extends IRouter<any>,
  AppState extends IAppState
>(
  context: Context,
  options: {
    render: IAppRenderFn<Context, never>;
    appState?: AppState;
  }
) {
  const router = undefined;
  const app = new Application({
    AppComponent,
    context,
    router: router as never,
    appState: options.appState,
    render: options.render
  });
  runPlugins(app);
  return app;
}
