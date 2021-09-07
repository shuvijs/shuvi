import * as AppHooks from './src/application-hooks';
import { IHookable, Hookable } from '@shuvi/hooks';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';
import * as Runtime from './src/runtime';
import * as Bundler from './src/bundler';
import * as APIHooks from './src/hooks';
export * from './src/application';
export * from './src/apiRoute';
export { webpack, WebpackChain };
export { IHookable, Hookable };
interface ITemplateData {
  [x: string]: any;
}

export { Runtime, Bundler, APIHooks, AppHooks, ITemplateData };

export type IShuviMode = 'development' | 'production';

export interface IPaths {
  rootDir: string;
  buildDir: string;

  // dir to store shuvi generated src files
  appDir: string;

  // user src dir
  srcDir: string;

  // functional dirs
  pagesDir: string;

  // api dirs
  apisDir: string;

  publicDir: string;
}

export interface IConfigCore {
  outputPath: string;
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'memory' | 'auto';

export type IPluginConfig =
  | string
  | [
      string /* plugin module */,
      any? /* plugin options */,
      string? /* identifier */
    ]
  | ((api: IApi) => void);

export type IPresetConfig =
  | string
  | [string /* plugin module */, any? /* plugin options */];

export type IRuntimeConfig = Record<string, string>;

export declare type IPhase =
  | 'PHASE_PRODUCTION_BUILD'
  | 'PHASE_PRODUCTION_SERVER'
  | 'PHASE_DEVELOPMENT_SERVER'
  | 'PHASE_INSPECT_WEBPACK';

interface IPlatform {
  name: string;
  framework?: string;
  target?: string;
  [index: string]: any;
}
export interface IApiConfig {
  outputPath: string;
  rootDir: string;
  ssr: boolean;
  publicDir: string;
  publicPath: string;
  env: Record<string, string>;
  router: {
    history: IRouterHistoryMode;
  };
  routes?: Runtime.IUserRouteConfig[]; // generate by files what under src/pages or user defined
  apiRoutes?: Runtime.IApiRouteConfig[]; // generate by files what under src/apis or user defined
  apiConfig?: {
    prefix?: string;
    /**
     * The byte limit of the body. This is the number of bytes or any string
     * format supported by `bytes`, for example `1000`, `'500kb'` or `'3mb'`
     * default is 1mb.
     */
    bodyParser?: { sizeLimit: number | string } | boolean;
  };
  runtimeConfig?: IRuntimeConfig;
  /**
   * specifically target for `platform-web`
   */
  target?: 'spa' | 'ssr';
  platform?: IPlatform;
  proxy?: any;
  plugins?: IPluginConfig[];
  presets?: IPresetConfig[];
  analyze?: boolean;
  asyncEntry?: boolean;
}

interface FileSnippets {
  tsDeclareModule: (
    exports: { [source: string]: string | string[] },
    typeName: string
  ) => string;
  exportsFromObject: (exports: { [source: string]: string[] }) => string;
  moduleExportProxy: (
    source: string | string[],
    defaultExport?: boolean
  ) => string;
  moduleExportProxyCreater: () => {
    getContent: (source: string | string[], defaultExport?: boolean) => string;
    mounted: () => void;
    unmounted: () => void;
  };
  findFirstExistedFile: (files: string[]) => string | null;
}
interface ApiHelpers {
  fileSnippets: FileSnippets;
}
// api for plugins
export interface IApi extends IHookable {
  readonly mode: IShuviMode;
  readonly paths: IPaths;
  readonly config: IApiConfig;
  readonly phase: IPhase;
  readonly clientManifest: Bundler.IManifest;
  readonly helpers: ApiHelpers;

  addEntryCode: any;
  addAppFile: any;
  addAppExport: any;
  addAppService: any;
  addAppPolyfill: any;
  addRuntimePlugin: any;

  setPlatformModule: (module: string) => void;
  setClientModule: any;
  setServerModule: any;

  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}
