import {
  CorePluginConstructor,
  CorePluginInstance,
  PluginRunner
} from './lifecycle';
import { FileOption } from '../project';
import {
  IServerMiddleware,
  IServerPluginContext,
  ServerPluginInstance
} from '../server';
import { DevMiddleware } from '../server/middlewares/dev';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends {} ? Partial<T[P]> : T[P];
};

export type IServiceMode = 'development' | 'production';

export interface IPreset {
  id: string;
  get: () => IPresetSpec;
}

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
  resources: string;

  // cache file
  cacheDir: string;

  // dir to store public assets
  publicDir: string;
}

export type IPluginConfig =
  | string
  | CorePluginConstructor
  | CorePluginInstance
  | [string, any?];

export type IPresetConfig =
  | string
  | [string /* plugin module */, any? /* plugin options */];

export interface IPresetSpec {
  (options: any): {
    presets?: IPresetConfig[];
    plugins?: IPluginConfig[];
  };
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
  ) => FileOption<any>[] | Promise<FileOption<any>[]>;
  getMiddlewares?: (
    context: IServerPluginContext
  ) => IServerMiddleware | IServerMiddleware[];
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
  reactRemoveProperties?:
    | boolean
    | {
        properties?: string[];
      };
  removeConsole?:
    | boolean
    | {
        exclude?: string[];
      };
  styledComponents?:
    | boolean
    | {
        /**
         * Enabled by default in development, disabled in production to reduce file size,
         * setting this will override the default for all environments.
         */
        displayName?: boolean;
        topLevelImportPaths?: string[];
        ssr?: boolean;
        fileName?: boolean;
        meaninglessFileNames?: string[];
        minify?: boolean;
        transpileTemplateLiterals?: boolean;
        namespace?: string;
        pure?: boolean;
        cssProp?: boolean;
      };
  emotion?:
    | boolean
    | {
        sourceMap?: boolean;
        autoLabel?: 'dev-only' | 'always' | 'never';
        labelFormat?: string;
      };
  disableShuviDynamic?: boolean;
  experimentalDecorators?: boolean;
  emitDecoratorMetadata?: boolean;
  useDefineForClassFields?: boolean;
  jsxImportSource?: string;
}

export interface InternalConfig {
  env: Record<string, string>;
  outputPath: string;
  publicDir: string;
  publicPath: string;
  analyze: boolean;
  typescript: { ignoreBuildErrors: boolean };
  proxy?: IProxyConfig;
  compiler?: CompilerConfig;
  disposeInactivePage: boolean;
  experimental: {
    parcelCss: boolean;
    preBundle: boolean;
    // browsersListForSwc?: boolean;
    modularizeImports?: Record<
      string,
      {
        transform: string;
        preventFullImport?: boolean;
        skipDefaultConversion?: boolean;
      }
    >;
    swcPlugins?: Array<[string, Record<string, unknown>]>;
  };
}

export type IProxyConfig = any;

export interface Config
  extends DeepPartial<InternalConfig>,
    DeepPartial<CustomConfig> {}

export interface NormalizedConfig extends InternalConfig, CustomConfig {}

export interface IPluginContext {
  mode: IServiceMode;
  paths: IPaths;
  config: NormalizedConfig;
  phase: IServicePhase;
  pluginRunner: PluginRunner;
  assetPublicPath: string;
  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}
