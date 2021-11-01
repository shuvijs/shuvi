import { IHookable } from '@shuvi/hook';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import {
  IApplicationCreaterServerContext,
  IViewServer,
  IRuntimeConfig
} from '@shuvi/platform-core';
import { ApplicationCreater } from '@shuvi/runtime-core';
import { PluginApi } from './pluginApi';
import { FileSnippets } from '../project/file-snippets';
import { ProjectBuilder } from '../project';
import { IDocumentModule, IServerModule } from '../types/index';

import { IServerMiddleware } from './serverMiddleware';

export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
  redirect?: string;
  path: string;
  id?: string;
}

export interface IApiRouteConfig {
  path: string;
  apiModule: string;
}

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
  routes?: IUserRouteConfig[]; // generate by files what under src/pages or user defined
  apiRoutes?: IApiRouteConfig[]; // generate by files what under src/apis or user defined
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
  platform: IPlatform;
  proxy?: any;
  plugins?: IPluginConfig[];
  presets?: IPresetConfig[];
  analyze?: boolean;
  asyncEntry?: boolean;
}

export type IConfig = Partial<IApiConfig>;

interface ApiHelpers {
  fileSnippets: FileSnippets;
}

// api for plugins
export interface IApi extends IHookable {
  readonly mode: IShuviMode;
  readonly paths: IPaths;
  readonly config: IApiConfig;
  readonly phase: IPhase;
  readonly clientManifest: IManifest;
  readonly helpers: ApiHelpers;

  addEntryCode: typeof ProjectBuilder.prototype.addEntryCode;
  addAppFile: typeof ProjectBuilder.prototype.addFile;
  addAppExport: typeof ProjectBuilder.prototype.addExport;
  addAppService: typeof ProjectBuilder.prototype.addService;
  addAppPolyfill: typeof ProjectBuilder.prototype.addPolyfill;
  addRuntimePlugin: typeof ProjectBuilder.prototype.addRuntimePlugin;

  setPlatformModule: typeof ProjectBuilder.prototype.setPlatformModule;
  setClientModule: typeof ProjectBuilder.prototype.setClientModule;
  setServerModule: typeof ProjectBuilder.prototype.setServerModule;

  addServerMiddleware: (serverMiddleware: IServerMiddleware) => void;
  addServerMiddlewareLast: (serverMiddleware: IServerMiddleware) => void;

  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}

export type IBuiltResource = {
  server: {
    server: IServerModule;
    apiRoutes: IApiRouteConfig[];
    application: {
      create: ApplicationCreater<IApplicationCreaterServerContext>;
    };
    document: Partial<IDocumentModule>;
    view: IViewServer;
  };
  documentTemplate: any;
  clientManifest: IManifest;
  serverManifest: IManifest;
};

export type IResources<Extra = {}> = IBuiltResource & {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

export interface IPluginSpec {
  modifyConfig?(config: IApiConfig, phase: IPhase): Promise<IApiConfig>;
  apply(api: PluginApi): void;
}

export interface IPresetSpec {
  (api: PluginApi): {
    presets?: IApiConfig['presets'];
    plugins?: IApiConfig['plugins'];
  };
}

export interface IPlugin {
  id: string;
  get: () => IPluginSpec;
}

export interface IPreset {
  id: string;
  get: () => IPresetSpec;
}
