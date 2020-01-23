import React from "react";
import { Runtime, Application } from "@shuvi/core";
import { renderDocument, renderApp } from "./renderer";
import { resolveSource } from "./paths";

class ReactRuntime implements Runtime.Runtime<React.ComponentType<any>> {
  install(app: Application): void {
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
    console.log("install react runtime");
  }

  renderDocument(
    Document: React.ComponentType<any>,
    options: Runtime.RenderDocumentOptions
  ): string {
    return renderDocument(Document, options);
  }

  renderApp(
    App: React.ComponentType<any>,
    options: Runtime.RenderAppOptions
  ): string {
    return renderApp(App, options);
  }

  getDocumentFilePath(): string {
    return resolveSource("document");
  }

  getBootstrapFilePath(): string {
    return resolveSource("bootstrap");
  }
}

export default new ReactRuntime();
