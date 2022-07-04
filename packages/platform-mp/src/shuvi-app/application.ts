import AppComponent from '@shuvi/app/core/app';
import { getStoreManager } from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';

export function createApp() {
  const router = undefined;

  return application({
    AppComponent,
    router: router as never,
    storeManager: getStoreManager()
  });
}
