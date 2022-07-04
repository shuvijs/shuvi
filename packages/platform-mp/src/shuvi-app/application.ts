import { app as AppComponent } from '@shuvi/app/core/platform';
import { getModelManager } from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';

export function createApp() {
  const router = undefined;

  return application({
    AppComponent,
    router: router as never,
    modelManager: getModelManager()
  });
}
