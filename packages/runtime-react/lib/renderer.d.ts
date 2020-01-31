/// <reference types="node" />
import React from "react";
import { IncomingMessage, ServerResponse } from "http";
import { Runtime } from "@shuvi/core";
export declare function renderDocument(req: IncomingMessage, res: ServerResponse, Document: React.ComponentType<Runtime.DocumentProps>, App: React.ComponentType<any> | null, options: Runtime.RenderDocumentOptions): Promise<string>;
