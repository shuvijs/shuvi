type Obj = Record<string, any>;

export type LoaderSWCOptions = {
  filename: string;
  isServer: boolean;
  isPageFile: boolean;
  development: boolean;
  minify: boolean | Obj;
  hasReactRefresh: boolean;
  supportedBrowsers: any[];
  experimental: Obj;
  compiler: Obj;
  swcCacheDir: string;
  keep: string[];
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
  minify,
  development,
  hasReactRefresh,
  isServer,
  experimental,
  compiler,
  swcCacheDir,
  keep
}: Omit<LoaderSWCOptions, 'supportedBrowsers'>) {
  const parserConfig = getParserOptions({ filename, compiler });
  const enableDecorators = Boolean(compiler?.experimentalDecorators);
  const emitDecoratorMetadata = Boolean(compiler?.emitDecoratorMetadata);
  const useDefineForClassFields = Boolean(compiler?.useDefineForClassFields);
  const plugins = (experimental?.swcPlugins ?? [])
    .filter(Array.isArray)
    .map(([name, options]: [string, any]) => [require.resolve(name), options]);

  return {
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
    isDevelopment: development,
    isServer,
    isPageFile,
    shakeExports: keep.length > 0 ? { ignore: keep } : null,
    disableShuviDynamic: compiler?.disableShuviDynamic || false,
    cssModuleFlag: 'cssmodules',
    sourceMaps: undefined,
    styledComponents: getStyledComponentsOptions(compiler, development),
    removeConsole: compiler?.removeConsole,
    reactRemoveProperties: compiler?.reactRemoveProperties,
    modularizeImports: experimental?.modularizeImports,
    emotion: getEmotionOptions(compiler, development)
  };
}

function getStyledComponentsOptions(compiler: Obj, development: boolean) {
  let styledComponentsOptions = compiler?.styledComponents;
  if (!styledComponentsOptions) {
    return null;
  }

  return {
    ...styledComponentsOptions,
    displayName: styledComponentsOptions.displayName ?? Boolean(development)
  };
}

function getEmotionOptions(compiler: Obj, development: boolean) {
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
  hasReactRefresh,
  experimental,
  compiler,
  supportedBrowsers,
  swcCacheDir,
  keep
}: // This is not passed yet as "paths" resolving is handled by webpack currently.
LoaderSWCOptions) {
  let baseOptions = getBaseSWCOptions({
    filename,
    isPageFile,
    development,
    isServer,
    minify,
    hasReactRefresh,
    experimental,
    compiler,
    swcCacheDir,
    keep
  });

  if (isServer) {
    (baseOptions as typeof baseOptions & { env: Record<string, any> }).env = {
      targets: {
        // Targets the current version of Node.js
        node: process.versions.node
      }
    };
  } else {
    // Matches default @babel/preset-env behavior
    (baseOptions.jsc as typeof baseOptions.jsc & { target: string }).target =
      'es5';
    if (supportedBrowsers && supportedBrowsers.length > 0) {
      (baseOptions as typeof baseOptions & { env: Record<string, any> }).env = {
        targets: supportedBrowsers
      };
    }
  }
  return baseOptions;
}
