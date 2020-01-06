import React from "react";
import { Runtime, Application } from "@shuvi/core";
declare class ReactRuntime implements Runtime.Runtime<React.ComponentType<any>> {
    install(app: Application): void;
    renderDocument(Document: React.ComponentType<any>, options: Runtime.RenderDocumentOptions): string;
    renderApp(App: React.ComponentType<any>, options: Runtime.RenderAppOptions): string;
    getDocumentFilePath(): string;
    getBootstrapFilePath(): string;
}
declare const _default: ReactRuntime;
export default _default;
