import React from "react";
import * as Runtime from "@shuvi/types/runtime";
export declare function renderDocument(Document: React.ComponentType<Runtime.DocumentProps>, options: Runtime.RenderDocumentOptions): Promise<string>;
export declare function renderApp(App: React.ComponentType<Runtime.AppProps>, options: Runtime.RenderAppOptions): Promise<string>;
