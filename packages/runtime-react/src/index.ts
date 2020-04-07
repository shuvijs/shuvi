import React from "react";
import {
  IApi,
  Runtime,
  IHookAppRoutes,
  IHookAppRoutesFile
} from "@shuvi/types";
import { resolveDistFile } from "./paths";
import { matchRoutes } from "./router/matchRoutes";
import { config as configBundler } from "./bundler/config";

import RouteConfig = Runtime.IRouteConfig;

function modifyRoutes(routes: RouteConfig[]): RouteConfig[] {
  for (const route of routes) {
    if (route.routes && route.routes.length > 0) {
      route.routes = modifyRoutes(route.routes);
    }

    const filepath = route.componentFile;
    route.component = `
loadRouteComponent(() => import(/* webpackChunkName: "${route.id}" */"${filepath}"), {
  webpack: () => [require.resolveWeak("${filepath}")],
  modules: ["${filepath}"],
})
`.trim();
  }

  return routes;
}

class ReactRuntime implements Runtime.IRuntime<React.ComponentType<any>> {
  private _api!: IApi;

  async install(api: IApi): Promise<void> {
    this._api = api;

    api.addAppExport("@shuvi/runtime-react/es/head/head", {
      imported: "default",
      local: "Head"
    });
    api.addAppExport("@shuvi/runtime-react/es/dynamic", {
      imported: "default",
      local: "dynamic"
    });
    api.addAppExport("@shuvi/runtime-react/dep/react-router-dom", "Link");

    configBundler(api);

    api.tap<IHookAppRoutes>("app:routes", {
      name: "runtime-react",
      fn: (routes: RouteConfig[]) => modifyRoutes(routes)
    });

    // add necessary imports
    api.tap<IHookAppRoutesFile>("app:routes-file", {
      name: "runtime-react",
      fn: fileContent => {
        return `
import { loadRouteComponent } from '@shuvi/runtime-react/es/loadRouteComponent';
${fileContent}
`.trim();
      }
    });
  }

  matchRoutes(routes: RouteConfig[], pathname: string) {
    return matchRoutes(routes, pathname);
  }

  getRendererModulePath(): string {
    return resolveDistFile("renderer");
  }

  getBootstrapModulePath(): string {
    let {
      ssr,
      router: { history }
    } = this._api.config;

    if (history === "auto") {
      history = ssr ? "browser" : "hash";
    }

    if (history === "hash") {
      return resolveDistFile("bootstrap.hash");
    }

    return resolveDistFile("bootstrap.browser");
  }

  getAppModulePath(): string {
    return resolveDistFile("app");
  }

  get404ModulePath(): string {
    return resolveDistFile("page404");
  }

  getRouterModulePath(): string {
    return resolveDistFile("router/router");
  }
}

export default new ReactRuntime();
