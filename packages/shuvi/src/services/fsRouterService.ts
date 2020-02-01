import { RouterService } from "@shuvi/types/core";

// const PlaceHolderComp = null as any;

export default class RouterServiceImpl implements RouterService {
  getRoutes() {
    return [
      {
        path: "/",
        // component: PlaceHolderComp,
        componentFile:
          "/Users/lixi/Workspace/github/shuvi-test/src/pages/index.js"
      }
    ];
  }
}
