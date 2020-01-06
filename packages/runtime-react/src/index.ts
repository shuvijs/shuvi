import React from "react";
import { Runtime, Application } from "@shuvi/core";
import { renderDocument, renderApp } from "./renderer";
import { resolveSource } from "./paths";

class ReactRuntime implements Runtime.Runtime<React.ComponentType<any>> {
  install(app: Application): void {
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
