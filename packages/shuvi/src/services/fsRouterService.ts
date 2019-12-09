import { routerService } from "@shuvi/core";

export default class RouterServiceImpl implements routerService.RouterService {
  getRouteConfig() {
    return [
      {
        path: "/",
        component: ""
      }
    ];
  }
}
