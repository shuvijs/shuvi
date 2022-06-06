import AppComponent from '@shuvi/app/core/app';
import {
  IAppState,
  IAppRenderFn,
  getModelManager,
  Application,
  IClientContext,
  IAppData
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';
import { IRouter } from '@shuvi/router';

export function createApp<
  Router extends IRouter,
  CompType,
  AppState extends IAppState
>(options: {
  render: IAppRenderFn<IClientContext, never, CompType>;
  appData: IAppData<any, AppState>;
}): Application<IClientContext, Router, ReturnType<typeof getModelManager>> {
  const modelManager = getModelManager(options.appData?.appState);
  const context = {};
  const router = undefined;
  return platform({
    AppComponent,
    context,
    router: router as never,
    modelManager,
    render: options.render
  });
}
