export type SWCOptions = {
  filename: string;
  isNode: boolean;
  development: boolean;
  dynamicImport: boolean;
  disableShuviDynamic: boolean;
  flag: string;
  minify: boolean | Record<string, any>;
  hasReactRefresh: boolean;
};

export default function getSWCOptions({
  filename,
  isNode,
  development,
  dynamicImport,
  disableShuviDynamic,
  flag,
  minify,
  hasReactRefresh
}: SWCOptions) {
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');

  const jsc = {
    parser: {
      syntax: isTypeScript ? 'typescript' : 'ecmascript',
      dynamicImport,
      // Exclude regular TypeScript files from React transformation to prevent e.g. generic parameters and angle-bracket type assertion from being interpreted as JSX tags.
      [isTypeScript ? 'tsx' : 'jsx']: isTSFile ? false : true
    },

    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        // runtime: 'classic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment',
        throwIfNamespace: true,
        development,
        useBuiltins: true,
        refresh: hasReactRefresh
      },
      optimizer: {
        simplify: false,
        globals: {
          typeofs: {
            window: isNode ? 'undefined' : 'object'
          },
          envs: {
            NODE_ENV: development ? '"development"' : '"production"'
          }
        }
      },
      regenerator: {
        importPath: require.resolve('regenerator-runtime')
      }
    }
  };

  const swcOptions = {
    jsc,
    disableShuviDynamic,
    minify,
    flag,
    isServer: isNode
  };

  if (isNode) {
    // @ts-ignore
    swcOptions.env = {
      targets: {
        // Targets the current version of Node.js
        node: process.versions.node
      }
    };
  } else {
    // Matches default @babel/preset-env behavior
    (jsc as typeof jsc & { target: string }).target = 'es5';
  }
  return swcOptions;
}
