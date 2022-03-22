import {
  IAppState,
  IAppRenderFn,
  IApplicationCreaterServerContext,
  getAppStore,
  Application
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';
import { IRouter } from '@shuvi/router';

export function createApp<
  Context extends IApplicationCreaterServerContext,
  Router extends IRouter,
  CompType,
  AppState extends IAppState
>(
  context: Context,
  options: {
    render: IAppRenderFn<Context, never>;
    appState?: AppState;
  }
): Application<Context, Router, ReturnType<typeof getAppStore>> {
  const appStore = getAppStore(options.appState);
  const router = undefined;
  return platform(
    {
      AppComponent: null,
      context,
      router: router as never,
      appStore,
      render: options.render
    },
    false
  );
}
