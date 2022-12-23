import { CompilerOptions } from '@shuvi/toolpack/webpack/loaders/shuvi-swc-loader';
import {
  CorePluginConstructor,
  CorePluginFactory,
  CorePluginInstance,
  PluginRunner
} from './plugin';
import { FileOptionWithId } from '../project';
import { IProxyConfig } from '../server/middlewares/httpProxyMiddleware';
import {
  IServerMiddleware,
  IServerPluginContext,
  ServerPluginInstance,
  ServerPluginConstructor,
  ServerPluginFactory
} from '../server';
import { DevMiddleware } from '../server/middlewares/dev';

export type { IProxyConfig };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends {} ? Partial<T[P]> : T[P];
};

export type IServiceMode = 'development' | 'production';

export interface IPaths {
  // project root
  rootDir: string;

  // dir to store output files
  buildDir: string;

  // dir to store user source files
  srcDir: string;

  // dir to generate conventional routes
  routesDir: string;

  // dir to store shuvi's artifacts
  privateDir: string;

  // dir to store shuvi generated src files
  appDir: string;

  // dir to runtime libraries
  runtimeDir: string;

  // resources file
  resourcesFile: string;

  // cache file
  cacheDir: string;

  // dir to store public assets
  publicDir: string;
}

export type CorePluginConfig =
  | CorePluginConstructor
  | CorePluginInstance
  | CorePluginFactory;

export type ServerPluginConfig =
  | ServerPluginConstructor
  | ServerPluginInstance
  | ServerPluginFactory;

export type DetailedPluginConfig = {
  core?: string | CorePluginConfig;
  server?: string | ServerPluginConfig;
  runtime?: string;
  types?: string;
};

export type IPluginConfig =
  | string // the path of single core plugin or all-in-one plugin
  | CorePluginConfig
  | DetailedPluginConfig
  | [string, any]
  | [CorePluginConfig, any]
  | [DetailedPluginConfig, any];

export type IPresetConfig =
  | string
  | [string /* plugin module */, any? /* plugin options */];

export type IPreset = (context: IPluginContext, options: any) => IPresetContent;

export type PresetFunction = IPreset;

export interface IPresetContent {
  presets?: IPresetConfig[];
  plugins?: IPluginConfig[];
}

export declare type IServicePhase =
  | 'PHASE_PRODUCTION_BUILD'
  | 'PHASE_PRODUCTION_SERVER'
  | 'PHASE_DEVELOPMENT_SERVER'
  | 'PHASE_INSPECT_WEBPACK';

export type RuntimePluginConfig = {
  plugin: string;
  options?: any;
};

/** plugin config that specify path of each file */
export interface ISplitPluginConfig {
  core?: string;
  server?: string;
  runtime?: string;
  types?: string;
}

export interface ResolvedPlugin {
  core?: CorePluginInstance; // instance
  server?: ServerPluginInstance; // instance
  runtime?: RuntimePluginConfig;
  types?: string;
}

export type IPlatformContent = {
  types?: string | string[];
  plugins?: (CorePluginInstance | ResolvedPlugin | string)[];
  getPresetRuntimeFiles: (
    context: IPluginContext
  ) => FileOptionWithId<any>[] | Promise<FileOptionWithId<any>[]>;
  getMiddlewares?: (
    context: IServerPluginContext
  ) => Promise<IServerMiddleware | IServerMiddleware[]>;
  getMiddlewaresBeforeDevMiddlewares?: (
    devMiddleware: DevMiddleware,
    context: IServerPluginContext
  ) => IServerMiddleware | IServerMiddleware[];
};

export type IPlatformContext = {
  serverPlugins: ServerPluginInstance[];
};

export type IPlatform = (
  context: IPlatformContext
) => Promise<IPlatformContent> | IPlatformContent;

export interface CustomCorePluginHooks
  extends ShuviService.CustomCorePluginHooks {}

export interface CustomConfig extends ShuviService.CustomConfig {}

export interface CompilerConfig {
  // general
  removeConsole?: CompilerOptions['removeConsole'];

  // react
  reactRemoveProperties?: CompilerOptions['reactRemoveProperties'];
  jsxImportSource?: CompilerOptions['jsxImportSource'];

  // third-party libraries
  styledComponents?: CompilerOptions['styledComponents'];
  emotion?: CompilerOptions['emotion'];

  // legacy decrator
  experimentalDecorators?: CompilerOptions['experimentalDecorators'];
  emitDecoratorMetadata?: CompilerOptions['emitDecoratorMetadata'];
}

export interface InternalConfig {
  presets?: IPresetConfig[];
  plugins?: IPluginConfig[];
  env: Record<string, string>;
  outputPath: string;
  publicPath: string;
  proxy?: IProxyConfig;
  analyze: boolean;
  disposeInactivePage: boolean;
  compiler?: CompilerConfig;
  typescript: { ignoreBuildErrors: boolean };
  experimental: {
    lightningCss: boolean;
    preBundle: boolean;
    // browsersListForSwc?: boolean;
    modularizeImports?: CompilerOptions['modularizeImports'];
    swcPlugins?: CompilerOptions['swcPlugins'];
  };
}

export interface ShuviConfig
  extends DeepPartial<InternalConfig>,
    DeepPartial<CustomConfig> {}

export interface NormalizedShuviConfig extends InternalConfig, CustomConfig {}

export interface IPluginContext {
  mode: IServiceMode;
  paths: IPaths;
  config: NormalizedShuviConfig;
  phase: IServicePhase;
  pluginRunner: PluginRunner;
  assetPublicPath: string;
  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
}
