import AppComponent from '@shuvi/app/core/app';
import { IAppState, IAppRenderFn, getAppStore } from '@shuvi/runtime-core';
import platform from '@shuvi/runtime-core/lib/platform';
import { IRouter } from '@shuvi/router';

export function createApp<
  Context extends { req: any },
  Router extends IRouter,
  CompType,
  AppState extends IAppState
>(
  context: Context,
  options: {
    render: IAppRenderFn<Context, never, CompType>;
    appState?: AppState;
  }
) {
  const appStore = getAppStore(options.appState);
  const router = undefined;
  return platform({
    AppComponent,
    context,
    router: router as never,
    appStore,
    render: options.render
  });
}
