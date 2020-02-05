/// <reference types="react" />
/// <reference lib="dom" />
import { RouteConfig } from "@shuvi/types/core";
declare type Data = Record<string, any>;
declare function renderRoutes(routes?: RouteConfig[], initialProps?: Data, switchProps?: Data): JSX.Element | null;
export default renderRoutes;
