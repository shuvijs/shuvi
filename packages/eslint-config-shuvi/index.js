/*
 * @rushstack/eslint-patch is used to include plugins as dev
 * dependencies instead of imposing them as peer dependencies
 *
 * https://www.npmjs.com/package/@rushstack/eslint-patch
 */
const keptPaths = [];
const sortedPaths = [];
const cwd = process.cwd().replace(/\\/g, '/');
const originalPaths = require.resolve.paths('eslint-plugin-import');

// eslint throws a conflict error when plugins resolve to different
// locations, since we want to lock our dependencies by default
// but also need to allow using user dependencies this updates
// our resolve paths to first check the cwd and iterate to
// eslint-config-next's dependencies if needed

for (let i = originalPaths.length - 1; i >= 0; i--) {
  const currentPath = originalPaths[i];

  if (currentPath.replace(/\\/g, '/').startsWith(cwd)) {
    sortedPaths.push(currentPath);
  } else {
    keptPaths.unshift(currentPath);
  }
}

// maintain order of node_modules outside of cwd
sortedPaths.push(...keptPaths);

const hookPropertyMap = new Map(
  [
    ['eslint-plugin-import', 'eslint-plugin-import'],
    ['eslint-plugin-react', 'eslint-plugin-react'],
    ['eslint-plugin-jsx-a11y', 'eslint-plugin-jsx-a11y']
  ].map(([request, replacement]) => [
    request,
    require.resolve(replacement, { paths: sortedPaths })
  ])
);

const mod = require('module');
const resolveFilename = mod._resolveFilename;
mod._resolveFilename = function (request, parent, isMain, options) {
  const hookResolved = hookPropertyMap.get(request);
  if (hookResolved) {
    request = hookResolved;
  }
  return resolveFilename.call(mod, request, parent, isMain, options);
};

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@shuvi/shuvi/recommended'
  ],
  plugins: ['@shuvi/shuvi', 'react', 'jsx-a11y'],
  rules: {
    'react/no-unknown-property': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-target-blank': 'off',
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn'
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    sourceType: 'module',
    allowImportExportEverywhere: true,
    babelOptions: {
      presets: [require.resolve('@shuvi/toolpack/lib/babel/preset')],
      caller: {
        // Eslint supports top level await when a parser for it is included. We enable the parser by default for Babel.
        supportsTopLevelAwait: true
      }
    }
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        warnOnUnsupportedTypeScriptVersion: true
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'import/parsers': {
      [require.resolve('@typescript-eslint/parser')]: [
        '.ts',
        '.mts',
        '.cts',
        '.tsx',
        '.d.ts'
      ]
    },
    'import/resolver': {
      [require.resolve('eslint-import-resolver-node')]: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      [require.resolve('eslint-import-resolver-typescript')]: {
        alwaysTryTypes: true
      }
    }
  },
  env: {
    browser: true,
    node: true
  }
};
