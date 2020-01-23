import connect from "@shuvi/toolpack/lib/utils/hotDevClient";
import {
  HOT_MIDDLEWARE_PATH,
  HOT_LAUNCH_EDITOR_ENDPOINT
} from "../../shared/constants";

export default (options = {}) => {
  const devClient = connect({
    ...options,
    launchEditorEndpoint: HOT_LAUNCH_EDITOR_ENDPOINT,
    path: HOT_MIDDLEWARE_PATH
  });

  devClient.subscribeToHmrEvent(obj => {
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
