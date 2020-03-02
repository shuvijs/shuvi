import * as Runtime from "./runtime";

export { Runtime };

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

export interface App<File = unknown> {
  dev: boolean;

  assetPublicPath: string;

  ssr: boolean;

  router: {
    history: RouterHistoryMode;
  };

  paths: Paths;

  addFile(file: File): void;

  watch(): void;

  build(): Promise<void>;

  on(event: "routes", listener: (routes: Runtime.RouteConfig[]) => void): void;

  getClientIndex(): string;

  resolveAppFile(...paths: string[]): string;

  resolveUserFile(...paths: string[]): string;

  resolveBuildFile(...paths: string[]): string;

  getAssetPublicUrl(...paths: string[]): string;
}
