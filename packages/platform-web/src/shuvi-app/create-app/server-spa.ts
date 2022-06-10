import {
  IAppRenderFn,
  getModelManager,
  IApplication
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';
import { IServerUserContext } from '@shuvi/platform-shared/lib/runtime';
import { IRequest } from '@shuvi/service/lib/server';

export function createApp(options: {
  render: IAppRenderFn<IServerUserContext>;
  req: IRequest;
}): IApplication {
  const { render, req } = options;
  const context = { req };
  const modelManager = getModelManager();
  const router = undefined;
  return platform(
    {
      AppComponent: null,
      context,
      router: router as never,
      modelManager,
      render
    },
    false
  );
}
