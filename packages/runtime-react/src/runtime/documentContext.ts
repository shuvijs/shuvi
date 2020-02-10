import { createContext } from "react";
import * as Runtime from "@shuvi/types/runtime";

export interface DocumentContextType {
  readonly documentProps: Runtime.DocumentProps;
}

export const DocumentContext = createContext<DocumentContextType>(
  {} as DocumentContextType
);
