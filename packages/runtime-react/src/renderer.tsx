import React from "react";
import { IncomingMessage, ServerResponse } from "http";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { Runtime } from "@shuvi/core";
import { StaticRouter } from "react-router-dom";
import Loadable from "./loadable";

export async function renderDocument(
  req: IncomingMessage,
  res: ServerResponse,
  Document: React.ComponentType<Runtime.DocumentProps>,
  App: React.ComponentType<any> | null,
  options: Runtime.RenderDocumentOptions
): Promise<string> {
  let htmlContent = "";
  if (App) {
    await Loadable.preloadAll();

    const context = {};
    htmlContent = renderToString(
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    );
  }

  return `<!DOCTYPE html>${renderToStaticMarkup(
    <Document {...options.documentProps} appHtml={htmlContent} />
  )}`;
}
