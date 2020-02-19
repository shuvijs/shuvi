import React from "react";
import * as Runtime from "@shuvi/types/runtime";
import { AppCore, RouteConfig, RouteMatch } from "@shuvi/types/core";
import { renderDocument, renderApp, matchRoutes } from "./renderer";
import { resolveDistFile } from "./paths";
import Loadable from "./loadable";

// fix yarn link with react hooks
if (process.env.SHUVI__SECRET_DO_NOT_USE__LINKED_PACKAGE) {
  const path = require("path");
  const resolveNodeModule = (req: string) =>
    path.resolve(__dirname, "../../../../node_modules", req);

  const BuiltinModule = require("module");
  // Guard against poorly mocked module constructors
  const Module =
    module.constructor.length > 1 ? module.constructor : BuiltinModule;

  const oldResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function(
    request: string,
    parentModule: any,
    isMain: boolean,
    options: any
  ) {
    let redirectdRequest = request;
    // make sure these packages are resolved into project/node_modules/
    // this only works on server side
    if (["react", "react-dom", "react-router-dom"].includes(request)) {
      redirectdRequest = resolveNodeModule(request);
    }

    return oldResolveFilename.call(
      this,
      redirectdRequest,
      parentModule,
      isMain,
      options
    );
  };
}

function serializeRoutes(routes: RouteConfig[]): string {
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
      if (key === "componentFile") {
        const filepath = route[key];
        strRoute += "component: ";
        strRoute += `
loadRouteComponent(() => import(/* webpackChunkName: "${route.id}" */"${filepath}"), {
  webpack: () => [require.resolveWeak("${filepath}")],
  modules: ["${filepath}"],
})`.trim();
      } else {
        strRoute += `${key}: ${JSON.stringify(route[key])}`;
      }

      strRoute += `,\n`;
    }
    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;

  //   return res.replace(/"componentFile":\w*"([^"]+)"/gi, (_match, filePath) => {
  //     const routeComponent = `
  // loadRouteComponent(() => import(/* webpackChunkName: "" */"${filePath}"), {
  //   webpack: () => [require.resolveWeak("${filePath}")],
  //   modules: ["${filePath}"],
  // })`.trim();
  //     const routeComponent = `
  // dynamic(() => import("${filePath}"))`.trim();
  // return `"component": ${routeComponent}`;
  // });
}

class ReactRuntime implements Runtime.Runtime<React.ComponentType<any>> {
  async install(app: AppCore): Promise<void> {
    console.log("install react runtime");
  }

  async renderDocument(
    Document: React.ComponentType<Runtime.DocumentProps>,
    options: Runtime.RenderDocumentOptions
  ): Promise<string> {
    return renderDocument(Document, options);
  }

  async prepareRenderApp() {
    return Loadable.preloadAll();
  }

  async renderApp(
    App: React.ComponentType<Runtime.AppProps>,
    options: Runtime.RenderAppOptions
  ): Promise<Runtime.RenderAppResult> {
    return renderApp(App, options);
  }

  generateRoutesSource(routes: RouteConfig[]): string {
    const routesExport = serializeRoutes(routes);

    return `
import { loadRouteComponent } from '@shuvi/runtime-react/lib/runtime/loadRouteComponent';
export default ${routesExport}
`.trim();
  }

  matchRoutes(routes: RouteConfig[], pathname: string): RouteMatch[] {
    return matchRoutes(routes, pathname);
  }

  getDocumentFilePath(): string {
    return resolveDistFile("client/document");
  }

  getBootstrapFilePath(): string {
    return resolveDistFile("client/bootstrap");
  }

  getAppFilePath(): string {
    return resolveDistFile("client/app");
  }
}

export default new ReactRuntime();
