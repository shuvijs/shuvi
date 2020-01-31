import { IncomingMessage, ServerResponse } from "http";
import React from "react";
import { Runtime, Application, RouterService } from "@shuvi/core";
import { matchRoutes } from "react-router-config";
import { renderDocument } from "./renderer";
import { resolveRuntime, resolveTemplate } from "./paths";

function serializeRoutes(routes: RouterService.RouteConfig[]): string {
  const res = JSON.stringify(routes);
  // Loadble(() => import("${res.componentFile}"))
  return res.replace(
    /"componentFile":\w*"([^"]+)"/gi,
    (match, filePath) => `"component": dynamic(() => import("${filePath}"))`
  );
}

class ReactRuntime implements Runtime.Runtime<React.ComponentType<any>> {
  async install(app: Application): Promise<void> {
    // fix yarn link with react hooks
    if (process.env.SHUVI__SECRET_DO_NOT_USE__LINKED_PACKAGE) {
      const path = require("path");
      const resolveNodeModule = (req: string) =>
        path.resolve(__dirname, "../../../node_modules", req);

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
        if (["react", "react-dom"].includes(request)) {
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

    const routeConfig = await app.getRouterConfig();
    app.addTemplateFile("routes.js", resolveTemplate("routes"), {
      routes: serializeRoutes(routeConfig.routes)
    });
    console.log("install react runtime");
  }

  async renderDocument(
    req: IncomingMessage,
    res: ServerResponse,
    Document: React.ComponentType<Runtime.DocumentProps>,
    App: React.ComponentType<any> | null,
    options: Runtime.RenderDocumentOptions
  ): Promise<string> {
    return renderDocument(req, res, Document, App, options);
  }

  matchRoutes(routes: RouterService.RouteConfig[], pathname: string) {
    return matchRoutes(routes, pathname);
  }

  // renderApp(
  //   App: React.ComponentType<any>,
  //   options: Runtime.RenderAppOptions
  // ): string {
  //   return renderApp(App, options);
  // }

  getBootstrapFilePath(): string {
    return resolveRuntime("client/bootstrap");
  }

  getDocumentFilePath(): string {
    return resolveRuntime("server/document");
  }

  getAppFilePath(): string {
    return resolveRuntime("shared/app");
  }
}

export default new ReactRuntime();
