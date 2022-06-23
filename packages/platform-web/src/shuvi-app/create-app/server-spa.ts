import { getModelManager } from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import { IRequest } from '@shuvi/service/lib/server';

// todo: remove this, no need a particular createApp for spa
export function createApp(options: { req: IRequest }) {
  const { req } = options;
  const context = { req };
  const router = undefined;

  return application({
    AppComponent: null,
    context,
    router: router as never,
    modelManager: getModelManager()
  });
}
