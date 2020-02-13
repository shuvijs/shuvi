import React from "react";
import * as Runtime from "@shuvi/types/runtime";
import { AppCore, RouteConfig, RouteMatch } from "@shuvi/types/core";
declare class ReactRuntime implements Runtime.Runtime<React.ComponentType<any>> {
    install(app: AppCore): Promise<void>;
    renderDocument(Document: React.ComponentType<Runtime.DocumentProps>, options: Runtime.RenderDocumentOptions): Promise<string>;
    prepareRenderApp(): Promise<void>;
    renderApp(App: React.ComponentType<Runtime.AppProps>, options: Runtime.RenderAppOptions): Promise<Runtime.RenderAppResult>;
    generateRoutesSource(routes: RouteConfig[]): string;
    matchRoutes(routes: RouteConfig[], pathname: string): RouteMatch[];
    getDocumentFilePath(): string;
    getBootstrapFilePath(): string;
    getAppFilePath(): string;
}
declare const _default: ReactRuntime;
export default _default;
