import AppComponent from '@shuvi/app/core/app';
import {
  IAppRenderFn,
  getModelManager,
  Application,
  IClientContext
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';
import { IRouter } from '@shuvi/router';

export function createApp<Router extends IRouter, CompType>(options: {
  render: IAppRenderFn<IClientContext, never, CompType>;
}): Application<IClientContext, Router, ReturnType<typeof getModelManager>> {
  const modelManager = getModelManager();
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
