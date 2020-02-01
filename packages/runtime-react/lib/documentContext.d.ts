/// <reference types="react" />
import * as Runtime from "@shuvi/types/runtime";
export interface DocumentContextType {
    readonly documentProps: Runtime.DocumentProps;
}
export declare const DocumentContext: import("react").Context<DocumentContextType>;
