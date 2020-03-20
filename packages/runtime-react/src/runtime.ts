import React from "react";
import { IApi, Runtime, Hooks } from "@shuvi/types";
import { File } from "@shuvi/core";
import { resolveDistFile } from "./paths";
import { matchRoutes } from "./router/matchRoutes";

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

    api.addFile(
      File.file("head.js", {
        content:
          "module.exports = require('@shuvi/runtime-react/lib/head/head');"
      })
    );
    api.addFile(
      File.file("dynamic.js", {
        content: "module.exports = require('@shuvi/runtime-react/lib/dynamic')"
      })
    );
    api.addFile(
      File.file("router.js", {
        content: "module.exports = require('@shuvi/runtime-react/lib/router')"
      })
    );
    api.addFile(
      File.file("link.js", {
        content:
          "module.exports = require('@shuvi/runtime-react/dep/react-router-dom').Link;"
      })
    );

    api.tap<Hooks.IAppRoutes>("app:routes", {
      name: "runtime-react",
      fn: (routes: RouteConfig[]) => modifyRoutes(routes)
    });

    // add necessary imports
    api.tap<Hooks.IAppRoutesFile>("app:routes-file", {
      name: "runtime-react",
      fn: fileContent => {
        return `
import { loadRouteComponent } from '@shuvi/runtime-react/lib/loadRouteComponent';
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

    if (ssr) {
      return resolveDistFile("bootstrap.ssr");
    }

    if (history === "hash") {
      return resolveDistFile("bootstrap.hash");
    }

    return resolveDistFile("bootstrap.browser");
  }

  getAppModulePath(): string {
    return resolveDistFile("app");
  }
}

export default new ReactRuntime();
