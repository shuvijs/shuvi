import AppComponent from '@shuvi/app/core/app';
import { getModelManager } from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';

export function createApp() {
  const context = {};
  const router = undefined;

  return application({
    AppComponent,
    context,
    router: router as never,
    modelManager: getModelManager()
  });
}
