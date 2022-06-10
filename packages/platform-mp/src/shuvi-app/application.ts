import AppComponent from '@shuvi/app/core/app';
import {
  IAppRenderFn,
  getModelManager,
  IApplication,
  IClientUserContext
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';

export function createApp<CompType>(options: {
  render: IAppRenderFn<IClientUserContext, CompType>;
}): IApplication {
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
