import React from "react";
import * as Runtime from "@shuvi/types/runtime";
import { RouteConfig, RouteMatch } from "@shuvi/types/core";
export declare function matchRoutes(routes: RouteConfig[], pathname: string): RouteMatch[];
export declare function renderDocument(Document: React.ComponentType<Runtime.DocumentProps>, options: Runtime.RenderDocumentOptions): Promise<string>;
export declare function renderApp(App: React.ComponentType<Runtime.AppProps>, options: Runtime.RenderAppOptions): Promise<Runtime.RenderAppResult>;
