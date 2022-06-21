import {
  IAppRenderFn,
  IApplication,
  getModelManager
} from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import { IServerAppContext } from '@shuvi/platform-shared/lib/runtime';
import { IRequest } from '@shuvi/service/lib/server';

// todo: remove this, no need a particular createApp for spa
export function createServerApp(options: {
  render: IAppRenderFn<IServerAppContext>;
  req: IRequest;
}): IApplication {
  const { render, req } = options;
  const router = undefined;
  return application({
    AppComponent: null,
    router: router as never,
    modelManager: getModelManager(),
    render,
    req
  });
}
