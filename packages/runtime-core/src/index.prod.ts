/// <reference lib="dom" />

import { bootstrap } from '@shuvi/app/core/bootstrap';
import App from '@shuvi/app/core/app';
import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';

bootstrap({
  AppComponent: App,
  appContainer: document.getElementById(CLIENT_CONTAINER_ID)!,
});
