import AppComponent from '@shuvi/app/core/app';
import {
  IAppRenderFn,
  IApplication,
  getModelManager,
  IClientAppContext
} from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';

export function createApp<CompType>(options: {
  render: IAppRenderFn<IClientAppContext, CompType>;
}): IApplication {
  const context = {};
  const router = undefined;
  return application({
    AppComponent,
    context,
    router: router as never,
    modelManager: getModelManager(),
    render: options.render
  });
}
