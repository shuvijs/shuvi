import {
  IAppState,
  IAppRenderFn,
  IApplicationCreaterServerContext,
  getAppStore
} from '@shuvi/platform-core';
import platform from '@shuvi/platform-core/lib/platform';
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
) {
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
