import { Application, IAppState } from '@shuvi/platform-core';
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
  const router = undefined;
  return new Application({
    AppComponent: null,
    context,
    router: router as never,
    appState: options.appState,
    render: options.render
  });
}
