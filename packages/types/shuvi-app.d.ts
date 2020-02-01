
declare module "@shuvi-app/routes" {
  import { RouteConfig } from "@shuvi/types/core";

  var routes: RouteConfig[];
  export default routes;
}

declare module "@shuvi-app/bootstrap" {
  import { Bootstrap } from "@shuvi/types/runtime";

  export const bootstrap: Bootstrap;
}

declare module "@shuvi-app/*"
