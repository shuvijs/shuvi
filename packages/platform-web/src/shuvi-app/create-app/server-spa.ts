import {
  IAppRenderFn,
  getModelManager,
  Application
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';
import { IServerContext } from '@shuvi/platform-shared/lib/runtime';
import { IRouter } from '@shuvi/router';
import { IRequest } from '@shuvi/service/lib/server';

export function createApp<Router extends IRouter>(options: {
  render: IAppRenderFn<IServerContext, never>;
  req: IRequest;
}): Application<IServerContext, Router, ReturnType<typeof getModelManager>> {
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
