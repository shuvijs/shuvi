import { File } from "./models/files";

export interface BuildOptions {
  dir: string;
}

export interface AppShell {

  setBootstrapModule(module: string): void;

  setAppModule(lookups: string[], fallback: string): void;

  setDocumentModule(lookups: string[], fallback: string): void;

  setRoutesSource(content: string): void;

  addFile(file: File): void;
  // waitUntilBuild(): Promise<void>;

  build(options: BuildOptions): Promise<void>;

  buildOnce(options: BuildOptions): Promise<void>;
}
