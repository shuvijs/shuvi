import AppComponent from '@shuvi/app/core/app';
import {
  IAppState,
  IAppRenderFn,
  getAppStore,
  Application
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';
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
): Application<Context, Router, ReturnType<typeof getAppStore>> {
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
