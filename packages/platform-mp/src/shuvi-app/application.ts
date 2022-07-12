import { app as AppComponent } from '@shuvi/app/core/platform';
import application from '@shuvi/platform-shared/shuvi-app/application';

export function createApp() {
  const router = undefined;

  return application({
    AppComponent,
    router: router as never
  });
}
