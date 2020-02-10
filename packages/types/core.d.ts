import { IncomingMessage, ServerResponse } from "http";
import { ParsedUrlQuery } from 'querystring'

export interface TemplateData {
  [x: string]: any;
}

export type FileType = "template" | "selector" | "normal";

export type FileNodeType = "file" | "dir";

export interface TemplateFile {
  $$type: "file";
  type: "template";
  name: string;
  template: string;
  data: TemplateData;
}

export interface SelectorFile {
  $$type: "file";
  type: "selector";
  name: string;
  files: string[];
}

export type File = TemplateFile | SelectorFile;

export interface Dir {
  $$type: "dir";
  name: string;
  children: Array<File | Dir>;
}

export type FileNode = File | Dir;

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

export interface RouteConfig {
  id: string;
  path?: string | string[];
  exact?: boolean;
  routes?: RouteConfig[];
  component?: any;
  componentFile: string;
  [x: string]: any;
}

export interface MatchedRoute<Params extends { [K in keyof Params]?: string }> {
  route: RouteConfig;
  match: {
    params: Params;
    isExact: boolean;
    path: string;
    url: string;
  };
}

export interface RouteMatch {
  route: RouteConfig;
  match: {
    url: string;
    isExact: boolean;
  };
}

export interface AppConfig {
  cwd: string;
  outputPath: string;
  publicPath: string;
}

export interface BuildOptions {
  bootstrapFilePath: string;
}

export interface RouteComponentContext {
  isServer: boolean;
  pathname: string;
  query: ParsedUrlQuery;
  req?: IncomingMessage;
  res?: ServerResponse;
}

export type RouteComponent<T, P = {}> = T & {
  getInitialProps?(context: RouteComponentContext): P | Promise<P>;
};

export interface AppCore {
  config: AppConfig;
  paths: Paths;

  resolveAppFile(...paths: string[]): string;

  resolveSrcFile(...paths: string[]): string;

  resolveBuildFile(...paths: string[]): string;

  getPublicUrlPath(...paths: string[]): string;

  addSelectorFile(
    path: string,
    selectFileList: string[],
    fallbackFile: string
  ): void;

  addTemplateFile(
    path: string,
    templateFile: string,
    data?: TemplateData
  ): void;

  addFile(path: string, { content }: { content: string }): void;

  setRoutesSource(content: string): void;

  build(options: BuildOptions): Promise<void>;

  buildOnce(options: BuildOptions): Promise<void>;
}
