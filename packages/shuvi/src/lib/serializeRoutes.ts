import { IRouteConfig } from "@shuvi/core";

export function serializeRoutes(routes: IRouteConfig[]): string {
  let res = "";
  for (let index = 0; index < routes.length; index++) {
    const { routes: childRoutes, ...route } = routes[index];
    if (childRoutes && childRoutes.length > 0) {
      serializeRoutes(childRoutes);
    }

    let strRoute = "";
    const keys = Object.keys(route);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      strRoute += `${key}: `;
      if (key === "component") {
        strRoute += route[key];
      } else {
        strRoute += JSON.stringify(route[key]);
      }

      strRoute += `,\n`;
    }
    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
}
