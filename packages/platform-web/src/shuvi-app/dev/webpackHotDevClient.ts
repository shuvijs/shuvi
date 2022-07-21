import connect from '@shuvi/toolpack/lib/utils/hotDevClient';
import {
  DEV_HOT_MIDDLEWARE_PATH,
  DEV_HOT_LAUNCH_EDITOR_ENDPOINT
} from '@shuvi/shared/lib/constants';

interface Event {
  action: string;
  [x: string]: any;
}

let devClient: ReturnType<typeof connect> | undefined;

export default (options = {}) => {
  if (devClient) {
    return devClient;
  }

  devClient = connect({
    ...options,
    launchEditorEndpoint: DEV_HOT_LAUNCH_EDITOR_ENDPOINT,
    path: DEV_HOT_MIDDLEWARE_PATH,
    location,
    WebSocket
  });

  devClient.subscribeToHmrEvent((event: Event) => {
    // if (obj.action === "reloadPage") {
    //   return window.location.reload();
    // }
    // if (obj.action === "removedPage") {
    //   const [page] = obj.data;
    //   if (page === window.next.router.pathname) {
    //     return window.location.reload();
    //   }
    //   return;
    // }
    // if (obj.action === "addedPage") {
    //   const [page] = obj.data;
    //   if (
    //     page === window.next.router.pathname &&
    //     typeof window.next.router.components[page] === "undefined"
    //   ) {
    //     return window.location.reload();
    //   }
    //   return;
    // }
    // throw new Error("Unexpected action " + obj.action);
  });

  return devClient;
};
