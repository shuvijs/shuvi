/// <reference path="../../client-env.d.ts" />

import React from "react";
import routes from "@shuvi-app/routes";
import { AppProps } from "@shuvi/types/runtime";
import renderRoutes from "@shuvi/runtime-react/lib/runtime/router/renderRoutes";

export { routes };

export function App(props: AppProps) {
  return <>{renderRoutes(routes, props.routeProps)}</>;
}
