import * as Runtime from "./runtime";
import * as Compiler from "./compiler";

export { Runtime, Compiler };

export interface Paths {
  projectDir: string;
  buildDir: string;

  // user src dir
  srcDir: string;

  // dir to store shuvi generated src files
  appDir: string;

  pagesDir: string;
  // pageDocument: string;
}

export type RouterHistoryMode = "browser" | "hash" | "auto";

export type BuillInResources = {
  app: any;
  documentTemplate: any;
  clientManifest: Compiler.Manifest;
  serverManifest: Compiler.Manifest;
};

export type Resources = BuillInResources & Record<string, any>;

export interface App<File = unknown> {
  dev: boolean;

  assetPublicPath: string;

  ssr: boolean;

  router: {
    history: RouterHistoryMode;
  };

  paths: Paths;

  resources: Resources;

  addFile(file: File): void;

  watch(): void;

  build(): Promise<void>;

  on(event: "routes", listener: (routes: Runtime.RouteConfig[]) => void): void;

  resolveAppFile(...paths: string[]): string;

  resolveUserFile(...paths: string[]): string;

  resolveBuildFile(...paths: string[]): string;

  getAssetPublicUrl(...paths: string[]): string;
}
