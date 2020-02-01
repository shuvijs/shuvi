import React from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import * as Runtime from "@shuvi/types/runtime";
import { StaticRouter } from "react-router-dom";
import Loadable, { LoadableContext } from "./loadable";

export async function renderDocument(
  Document: React.ComponentType<Runtime.DocumentProps>,
  options: Runtime.RenderDocumentOptions
): Promise<string> {
  return `<!DOCTYPE html>${renderToStaticMarkup(
    <Document {...options.documentProps} />
  )}`;
}

export async function renderApp(
  App: React.ComponentType<Runtime.AppProps>,
  options: Runtime.RenderAppOptions
): Promise<string> {
  const { url, context } = options;
  await Loadable.preloadAll();

  const htmlContent = renderToString(
    <StaticRouter location={url} context={context}>
      <LoadableContext.Provider
        value={moduleName => context.loadableModules.push(moduleName)}
      >
        <App />
      </LoadableContext.Provider>
    </StaticRouter>
  );

  return htmlContent;
}
