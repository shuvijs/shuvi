/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import React from "react";
import { Runtime, Application, RouterService } from "@shuvi/core";
declare class ReactRuntime implements Runtime.Runtime<React.ComponentType<any>> {
    install(app: Application): Promise<void>;
    renderDocument(req: IncomingMessage, res: ServerResponse, Document: React.ComponentType<Runtime.DocumentProps>, App: React.ComponentType<any> | null, options: Runtime.RenderDocumentOptions): Promise<string>;
    matchRoutes(routes: RouterService.RouteConfig[], pathname: string): import("react-router-config").MatchedRoute<{}>[];
    getBootstrapFilePath(): string;
    getDocumentFilePath(): string;
    getAppFilePath(): string;
}
declare const _default: ReactRuntime;
export default _default;
