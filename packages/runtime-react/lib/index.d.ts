import React from "react";
import * as Runtime from "@shuvi/types/runtime";
import { AppCore, RouteConfig } from "@shuvi/types/core";
declare class ReactRuntime implements Runtime.Runtime<React.ComponentType<any>> {
    install(app: AppCore): Promise<void>;
    renderDocument(Document: React.ComponentType<Runtime.DocumentProps>, options: Runtime.RenderDocumentOptions): Promise<string>;
    renderApp(App: React.ComponentType<Runtime.AppProps>, options: Runtime.RenderAppOptions): Promise<string>;
    matchRoutes(routes: RouteConfig[], pathname: string): import("react-router-config").MatchedRoute<{}>[];
    getBootstrapFilePath(): string;
    getDocumentFilePath(): string;
    getAppFilePath(): string;
}
declare const _default: ReactRuntime;
export default _default;
