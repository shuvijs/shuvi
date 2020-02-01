/// <reference path="../../../client-env.d.ts" />

import React from "react";
import { renderRoutes } from "@shuvi/runtime-react/dep/react-router-config";
import routes from "@shuvi-app/routes";

export default function App() {
  return <>{renderRoutes(routes)}</>;
}
