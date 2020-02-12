/// <reference path="../../client-env.d.ts" />

import React from "react";
import routes from "@shuvi-app/routes";
import renderRoutes from "@shuvi/runtime-react/lib/runtime/router/renderRoutes";

export { routes };

export function App() {
  return <>{renderRoutes(routes)}</>;
}
