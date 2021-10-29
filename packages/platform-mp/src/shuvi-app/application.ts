import AppComponent from '@shuvi/app/core/app';
import { IAppState, IAppRenderFn } from '@shuvi/platform-core';
import platform from '@shuvi/platform-core/lib/platform';
import { IRouter } from '@shuvi/router';

export function create<
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
  const router = undefined;
  return platform({
    AppComponent,
    context,
    router: router as never,
    appState: options.appState,
    render: options.render
  });
}
