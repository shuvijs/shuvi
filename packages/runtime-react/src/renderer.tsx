import React from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { Runtime } from "@shuvi/core";

export function renderDocument(
  Document: React.ComponentType<any>,
  options: Runtime.RenderDocumentOptions
) {
  return `<!DOCTYPE html>${renderToStaticMarkup(
    <Document {...options.documentProps} />
  )}`;
}

export function renderApp(
  App: React.ComponentType<any>,
  options: Runtime.RenderAppOptions
) {
  return renderToString(<App />);
}
