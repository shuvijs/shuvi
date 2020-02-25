import React from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { Runtime } from "@shuvi/core";
import { RouteConfig, RouteMatch } from "@shuvi/core";
import { Router } from "react-router-dom";
import { matchRoutes as reactRouterMatchRoutes } from "react-router-config";
import { createServerHistory } from "./router/history";
import { setHistory } from "./router/router";
import { LoadableContext } from "./loadable";

export function matchRoutes(
  routes: RouteConfig[],
  pathname: string
): RouteMatch[] {
  return (reactRouterMatchRoutes(routes, pathname) as any) as RouteMatch[];
}

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
): Promise<Runtime.RenderAppResult> {
  const { pathname, context, routeProps } = options;

  const history = createServerHistory({
    basename: "",
    location: pathname,
    context
  });
  setHistory(history);

  const htmlContent = renderToString(
    // @ts-ignore staticContext is not declared in @types/react-router-dom
    <Router history={history} staticContext={context}>
      <LoadableContext.Provider
        value={moduleName => context.loadableModules.push(moduleName)}
      >
        <App routeProps={routeProps} />
      </LoadableContext.Provider>
    </Router>
  );

  return {
    appHtml: htmlContent
  };
}
