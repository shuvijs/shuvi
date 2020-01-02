import React from "react";
import { Runtime, Application } from "@shuvi/core";
import { renderDocument, renderApp } from "./renderer";
import { resolveSource } from "./paths";

export default class ReactRuntime
  implements Runtime.Runtime<React.ComponentType<any>> {
  install(app: Application): void {
    console.log('install react runtime');
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

  getDocumentModulePath(): string {
    return resolveSource("document");
  }

  getBootstrapModulePath(): string {
    return resolveSource("bootstrap");
  }
}
