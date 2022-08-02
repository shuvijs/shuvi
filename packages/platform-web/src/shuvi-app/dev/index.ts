import { Application } from '@shuvi/platform-shared/shuvi-app/application';
import {
  DEV_SOCKET_TIMEOUT_MS,
  DEV_HOT_MIDDLEWARE_PATH,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT
} from '@shuvi/shared/esm/constants';
import connect, { HotDevClient } from './hotDevClient';

interface Event {
  action: string;
  [x: string]: any;
}

let devClient: HotDevClient;

export const initHMRAndDevClient = (app: Application) => {
  if (devClient) {
    return devClient;
  }

  devClient = connect({
    launchEditorEndpoint: DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
    path: DEV_HOT_MIDDLEWARE_PATH,
    location
  });

  setInterval(() => {
    devClient.sendMessage(
      JSON.stringify({
        event: 'updatePageStatus',
        currentRoutes: app.router.current.matches.map(
          ({ route: { __componentRawRequest__ } }) => __componentRawRequest__
        ),
        page: location.pathname
      })
    );
  }, DEV_SOCKET_TIMEOUT_MS / 2);

  devClient.subscribeToHmrEvent((event: Event) => {
    // if (obj.action === "reloadPage") {
    //   return window.location.reload();
    // }
    // throw new Error("Unexpected action " + obj.action);
  });

  return devClient;
};
