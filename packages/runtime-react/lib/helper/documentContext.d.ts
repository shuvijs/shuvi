/// <reference types="react" />
import { Runtime } from "@shuvi/core";
export interface DocumentContextType {
    readonly documentProps: Runtime.DocumentProps;
}
export declare const DocumentContext: import("react").Context<DocumentContextType>;
