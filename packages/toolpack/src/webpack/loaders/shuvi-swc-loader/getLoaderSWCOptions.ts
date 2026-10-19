import type {
  EnvConfig,
  JscConfig,
  JscTarget,
  Options,
  ParserConfig,
  TransformConfig,
  WasmPlugin
} from '@swc/types';

type Obj = Record<string, any>;

export interface CompilerOptions {
  removeConsole?: boolean;
  useDefineForClassFields?: boolean;
  reactRemoveProperties?: boolean;
  jsxImportSource?: string;
  jscTarget?: JscTarget;
  /**
   * swc `env` options for client build, e.g. `{ targets, mode: 'usage', coreJs }`.
   * When set, `jscTarget` is ignored because swc does not allow `env` and `jsc.target` together.
   */
  env?: EnvConfig;
  emotion?:
    | boolean
    | {
        sourceMap?: boolean;
        autoLabel?: 'dev-only' | 'always' | 'never';
        labelFormat?: string;
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

  experimentalDecorators?: boolean;
  emitDecoratorMetadata?: boolean;
  modularizeImports?: Record<
    string,
    {
      transform: string;
      preventFullImport?: boolean;
      skipDefaultConversion?: boolean;
    }
  >;
  swcPlugins?: [name: string, option: any][];
}

export type SWCLoaderOptions = {
  filename: string;
  isServer: boolean;
  isPageFile: boolean;
  pagePickLoader: boolean;
  development: boolean;
  minify: boolean | Obj;
  hasReactRefresh: boolean;
  supportedBrowsers?: string[] | false;
  swcCacheDir: string;
  compiler: CompilerOptions;
};

// fields accepted by shuvi's swc binding but missing in @swc/types
type ShuviParserConfig = ParserConfig & { importAssertions?: boolean };

interface ShuviTransformConfig extends TransformConfig {
  regenerator?: { importPath?: string };
}

interface ShuviJscConfig extends Omit<JscConfig, 'parser' | 'transform'> {
  parser?: ShuviParserConfig;
  transform?: ShuviTransformConfig;
}

export interface ShuviSWCOptions extends Omit<Options, 'jsc' | 'minify'> {
  jsc: ShuviJscConfig;
  minify?: boolean | Obj;
  isDevelopment?: boolean;

  // shuvi specific
  isServer?: boolean;
  isPageFile?: boolean;
  pagePickLoader?: boolean;
  cssModuleFlag?: string;

  // advanced
  removeConsole?: CompilerOptions['removeConsole'];
  reactRemoveProperties?: CompilerOptions['reactRemoveProperties'];
  modularizeImports?: CompilerOptions['modularizeImports'];

  // third-party libraries
  styledComponents?: ReturnType<typeof getStyledComponentsOptions>;
  emotion?: ReturnType<typeof getEmotionOptions>;
}

export function getParserOptions({
  filename,
  compiler
}: {
  filename: string;
  compiler: CompilerOptions;
}): ShuviParserConfig {
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const enableDecorators = Boolean(compiler?.experimentalDecorators);
  // Exclude regular TypeScript files from React transformation to prevent e.g. generic parameters and angle-bracket type assertion from being interpreted as JSX tags.
  if (isTypeScript) {
    return {
      syntax: 'typescript',
      dynamicImport: true,
      decorators: enableDecorators,
      tsx: !isTSFile,
      importAssertions: true
    };
  }
  return {
    syntax: 'ecmascript',
    dynamicImport: true,
    decorators: enableDecorators,
    jsx: true,
    importAssertions: true
  };
}

function getBaseSWCOptions({
  filename,
  isPageFile,
  pagePickLoader,
  minify,
  development,
  hasReactRefresh,
  isServer,
  compiler,
  swcCacheDir
}: Omit<SWCLoaderOptions, 'supportedBrowsers'>): ShuviSWCOptions {
  const parserConfig = getParserOptions({ filename, compiler });
  const enableDecorators = Boolean(compiler?.experimentalDecorators);
  const emitDecoratorMetadata = Boolean(compiler?.emitDecoratorMetadata);
  const useDefineForClassFields = Boolean(compiler?.useDefineForClassFields);
  const plugins = (compiler?.swcPlugins ?? [])
    .filter(Array.isArray)
    .map(([name, options]): WasmPlugin => [require.resolve(name), options]);

  return {
    isDevelopment: development,
    jsc: {
      externalHelpers: true,
      parser: parserConfig,
      experimental: {
        keepImportAssertions: true,
        plugins,
        cacheRoot: swcCacheDir
      },
      transform: {
        legacyDecorator: enableDecorators,
        decoratorMetadata: emitDecoratorMetadata,
        useDefineForClassFields: useDefineForClassFields,
        react: {
          importSource:
            compiler?.jsxImportSource ??
            (compiler?.emotion ? '@emotion/react' : 'react'),
          runtime: 'automatic',
          pragma: 'React.createElement',
          pragmaFrag: 'React.Fragment',
          throwIfNamespace: true,
          development: !!development,
          useBuiltins: true,
          refresh: !!hasReactRefresh
        },
        optimizer: {
          simplify: false,
          globals: {
            typeofs: {
              window: isServer ? 'undefined' : 'object'
            },
            envs: {
              NODE_ENV: development ? '"development"' : '"production"'
            }
            // TODO: handle process.browser to match babel replacing as well
          }
        },
        regenerator: {
          importPath: require.resolve('regenerator-runtime')
        }
      }
    },
    minify,
    sourceMaps: undefined,

    // shuvi specific
    isServer,
    isPageFile,
    pagePickLoader,
    cssModuleFlag: 'cssmodules',

    // advanced
    removeConsole: compiler?.removeConsole,
    reactRemoveProperties: compiler?.reactRemoveProperties,
    modularizeImports: compiler?.modularizeImports,

    // third-party libraries
    styledComponents: getStyledComponentsOptions(compiler, development),
    emotion: getEmotionOptions(compiler, development)
  };
}

function getStyledComponentsOptions(
  compiler: CompilerOptions,
  development: boolean
) {
  let styledComponentsOptions = compiler?.styledComponents;
  if (!styledComponentsOptions) {
    return null;
  }

  if (styledComponentsOptions === true) {
    styledComponentsOptions = {};
  }

  return {
    ...styledComponentsOptions,
    displayName: styledComponentsOptions.displayName ?? Boolean(development)
  };
}

function getEmotionOptions(compiler: CompilerOptions, development: boolean) {
  const emotion = compiler?.emotion;
  if (!emotion) {
    return null;
  }
  // default 'dev-only'
  let autoLabel = !!development;
  if (emotion === true) {
    return {
      enabled: true,
      autoLabel,
      sourcemap: autoLabel
    };
  }
  switch (emotion.autoLabel) {
    case 'never':
      autoLabel = false;
      break;
    case 'always':
      autoLabel = true;
      break;
    default:
      break;
  }
  return {
    enabled: true,
    autoLabel,
    labelFormat: emotion.labelFormat,
    sourcemap: development ? emotion.sourceMap ?? true : false
  };
}

export default function getLoaderSWCOptions({
  filename,
  development,
  isServer,
  minify,
  isPageFile,
  pagePickLoader,
  hasReactRefresh,
  compiler,
  supportedBrowsers,
  swcCacheDir
}: // This is not passed yet as "paths" resolving is handled by webpack currently.
SWCLoaderOptions): ShuviSWCOptions {
  const baseOptions = getBaseSWCOptions({
    filename,
    isPageFile,
    pagePickLoader,
    development,
    isServer,
    minify,
    hasReactRefresh,
    compiler,
    swcCacheDir
  });

  if (isServer) {
    baseOptions.env = {
      targets: {
        // Targets the current version of Node.js
        node: process.versions.node
      }
    };
  } else {
    const env: EnvConfig | undefined =
      compiler?.env ??
      (supportedBrowsers && supportedBrowsers.length > 0
        ? { targets: supportedBrowsers }
        : undefined);
    if (env) {
      // swc throws "`env` and `jsc.target` cannot be used together"
      baseOptions.env = env;
    } else {
      // Matches default @babel/preset-env behavior
      baseOptions.jsc.target = compiler?.jscTarget || 'es5';
    }
  }
  return baseOptions;
}
