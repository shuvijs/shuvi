import {
  IAppState,
  IAppRenderFn,
  IApplicationCreaterServerContext
} from '@shuvi/platform-core';
import platform from '@shuvi/platform-core/lib/platform';
import { IRouter } from '@shuvi/router';

export function create<
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
  const router = undefined;
  return platform(
    {
      AppComponent: null,
      context,
      router: router as never,
      appState: options.appState,
      render: options.render
    },
    false
  );
}
