import { createContext } from "react";
import { Runtime } from "@shuvi/core";

export interface DocumentContextType {
  readonly documentProps: Runtime.DocumentProps;
}

export const DocumentContext = createContext<DocumentContextType>(
  {} as DocumentContextType
);
