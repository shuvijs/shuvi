type Obj = Record<string, any>;

export interface CompilerOptions {
  removeConsole?: boolean;
  useDefineForClassFields?: boolean;
  reactRemoveProperties?: boolean;
  jsxImportSource?: string;
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
  supportedBrowsers: any[];
  swcCacheDir: string;
  compiler: CompilerOptions;
};

export function getParserOptions({
  filename,
  compiler,
  ...rest
}: {
  filename: string;
  compiler: Obj;
}) {
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const enableDecorators = Boolean(compiler?.experimentalDecorators);
  return {
    ...rest,
    syntax: isTypeScript ? 'typescript' : 'ecmascript',
    dynamicImport: true,
    decorators: enableDecorators,
    // Exclude regular TypeScript files from React transformation to prevent e.g. generic parameters and angle-bracket type assertion from being interpreted as JSX tags.
    [isTypeScript ? 'tsx' : 'jsx']: !isTSFile,
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
}: Omit<SWCLoaderOptions, 'supportedBrowsers'>) {
  const parserConfig = getParserOptions({ filename, compiler });
  const enableDecorators = Boolean(compiler?.experimentalDecorators);
  const emitDecoratorMetadata = Boolean(compiler?.emitDecoratorMetadata);
  const useDefineForClassFields = Boolean(compiler?.useDefineForClassFields);
  const plugins = (compiler?.swcPlugins ?? [])
    .filter(Array.isArray)
    .map(([name, options]: [string, any]) => [require.resolve(name), options]);

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
SWCLoaderOptions) {
  let baseOptions = getBaseSWCOptions({
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
    (baseOptions as any).env = {
      targets: {
        // Targets the current version of Node.js
        node: process.versions.node
      }
    };
  } else {
    // Matches default @babel/preset-env behavior
    (baseOptions.jsc as any).target = 'es5';
    if (supportedBrowsers && supportedBrowsers.length > 0) {
      (baseOptions as any).env = {
        targets: supportedBrowsers
      };
    }
  }
  return baseOptions;
}
