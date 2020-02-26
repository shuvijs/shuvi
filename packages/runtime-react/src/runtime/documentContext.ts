import { createContext } from "react";
import { Runtime } from "@shuvi/types";

export interface DocumentContextType {
  readonly documentProps: Runtime.DocumentProps;
}

export const DocumentContext = createContext<DocumentContextType>(
  {} as DocumentContextType
);
