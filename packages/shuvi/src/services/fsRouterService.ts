import { RouterService } from "@shuvi/core";

export default class RouterServiceImpl implements RouterService.RouterService {
  getRouteConfig() {
    return [
      {
        path: "/",
        component: ""
      }
    ];
  }
}
