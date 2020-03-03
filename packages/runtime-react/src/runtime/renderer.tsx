import React from "react";
import { renderToString } from "react-dom/server";
import { Runtime } from "@shuvi/types";
import { Router } from "react-router-dom";
import { matchRoutes as reactRouterMatchRoutes } from "react-router-config";
import { createServerHistory } from "./router/history";
import { setHistory } from "./router/router";
import { LoadableContext } from "./loadable";

import RouteConfig = Runtime.RouteConfig;
import MatchedRoute = Runtime.MatchedRoute;

export function matchRoutes(
  routes: RouteConfig[],
  pathname: string
): MatchedRoute[] {
  return (reactRouterMatchRoutes(routes, pathname) as any) as MatchedRoute[];
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
