/// <reference path="../client-env.d.ts" />

import React, { useContext } from "react";
import routes from "@shuvi/app/routes";
import renderRoutes from "./router/renderRoutes";
import { AppContext } from "./AppContainer";

export function App() {
  const { appProps } = useContext(AppContext);
  return <>{renderRoutes(routes, appProps.routeProps)}</>;
}
