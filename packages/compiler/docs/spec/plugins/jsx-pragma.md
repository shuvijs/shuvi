# JSX Pragma Plugin

## Overview

The JSX Pragma plugin is a SWC transform that automatically transforms JSX syntax to use a local identifier for the JSX factory function. The plugin intelligently handles both ES modules and CommonJS modules, and supports React Fragment syntax. It can be configured to use custom pragma names and import sources.

## Getting Started

```bash
# Install the compiler package
pnpm add @shuvi/compiler
```

## Usage

### Direct Transform Usage

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  jsc: {
    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment'
      }
    }
  }
});
```

### Loader Usage

Use the `@shuvi/swc-loader` to transform JSX in your build pipeline.

```ts
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: '@shuvi/swc-loader',
          options: {
            jsc: {
              transform: {
                react: {
                  importSource: 'react',
                  runtime: 'automatic',
                  pragma: 'React.createElement',
                  pragmaFrag: 'React.Fragment'
                }
              }
            }
          }
        }
      }
    ]
  }
};
```

## API

### Configuration

| Option             | Type      | Default                 | Description                                 |
| ------------------ | --------- | ----------------------- | ------------------------------------------- |
| `importSource`     | `string`  | `'react'`               | The module to import JSX runtime from       |
| `runtime`          | `string`  | `'automatic'`           | JSX runtime mode ('automatic' or 'classic') |
| `pragma`           | `string`  | `'React.createElement'` | The pragma function name for JSX elements   |
| `pragmaFrag`       | `string`  | `'React.Fragment'`      | The pragma function name for JSX fragments  |
| `throwIfNamespace` | `boolean` | `true`                  | Whether to throw on namespace usage         |
| `development`      | `boolean` | `false`                 | Enable development mode features            |
| `useBuiltins`      | `boolean` | `true`                  | Use built-in JSX helpers                    |
| `refresh`          | `boolean` | `false`                 | Enable React refresh support                |

## Behavior Specification

### 1. JSX Transformation

The plugin transforms JSX syntax by importing the necessary JSX runtime functions and using them for all JSX elements.

#### Automatic Runtime Mode

- **Import Generation**: Automatically imports `jsx` and `Fragment` from the specified import source
- **Local Identifiers**: Uses local identifiers (`_jsx`, `_Fragment`) to avoid naming conflicts
- **Element Transformation**: Transforms JSX elements to function calls using the local identifier

#### Classic Runtime Mode

- **Import Generation**: Imports the specified module and creates a local pragma variable
- **Pragma Mapping**: Maps the pragma to the specified property (e.g., `React.createElement`)
- **Element Transformation**: Transforms JSX elements to pragma function calls

### 2. Fragment Support

JSX Fragment syntax (`<>...</>`) is supported and transformed appropriately:

- **Automatic Runtime**: Imports `Fragment` as `_Fragment` and uses it for fragments
- **Classic Runtime**: Uses the specified `pragmaFrag` for fragment elements

### 3. Module System Support

The plugin supports both ES modules and CommonJS:

- **ES Modules**: Uses `import` statements for runtime imports
- **CommonJS**: Uses `require()` statements for runtime imports

### 4. Existing Import Detection

The plugin intelligently detects existing React imports and reuses them when possible:

- **Scope Analysis**: Checks for existing bindings in the current scope
- **Import Reuse**: Avoids duplicate imports when React is already imported
- **Require Support**: Handles both `import` and `require()` statements

## Test Cases

Please refer to the [test cases](../../../src/swc/__tests__/plugins/jsx-pragma.test.ts) for detailed examples.

### 1. Basic JSX Transformation (Automatic Runtime)

**Description**: Tests automatic transformation of JSX elements using the automatic runtime mode.

#### Input

```tsx
const a = () => <a href="/">home</a>;
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  jsc: {
    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment'
      }
    }
  }
});
```

#### Output

```ts
import { jsx as _jsx } from 'react/jsx-runtime';
var a = function () {
  return _jsx('a', { href: '/', children: 'home' });
};
```

### 2. Fragment Syntax Support

**Description**: Tests JSX Fragment syntax transformation with automatic runtime.

#### Input

```tsx
const a = () => <>hello</>;
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  jsc: {
    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment'
      }
    }
  }
});
```

#### Output

```ts
import { jsx as _jsx, Fragment as _Fragment } from 'react/jsx-runtime';
var a = function () {
  return _jsx(_Fragment, { children: 'hello' });
};
```

### 3. CommonJS Support

**Description**: Tests JSX transformation in CommonJS modules with existing React require.

#### Input

```ts
const React = require('react');
module.exports = () => <div>test2</div>;
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  jsc: {
    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment'
      }
    }
  }
});
```

#### Output

```ts
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var _jsxRuntime = require('react/jsx-runtime');
var React = require('react');
module.exports = function () {
  return (0, _jsxRuntime.jsx)('div', { children: 'test2' });
};
```

### 4. Classic Runtime Mode (Babel Plugin)

**Description**: Tests JSX transformation using classic runtime mode with custom pragma.

#### Input

```tsx
const a = () => <a href="/">home</a>;
```

#### Transform Code

```ts
import { transform } from '@babel/core';

const result = transform(code, {
  presets: [['@babel/preset-react', { pragma: '__jsx' }]],
  plugins: [
    [
      'jsx-pragma',
      {
        module: 'react',
        importAs: 'React',
        pragma: '__jsx',
        property: 'createElement'
      }
    ]
  ]
});
```

#### Output

```ts
import React from 'react';
var __jsx = React.createElement;
const a = () => __jsx('a', { href: '/' }, 'home');
```

### 5. Fragment with Classic Runtime

**Description**: Tests JSX Fragment syntax with classic runtime mode.

#### Input

```tsx
const a = () => <>hello</>;
```

#### Transform Code

```ts
import { transform } from '@babel/core';

const result = transform(code, {
  presets: [['@babel/preset-react', { pragma: '__jsx' }]],
  plugins: [
    [
      'jsx-pragma',
      {
        module: 'react',
        importAs: 'React',
        pragma: '__jsx',
        property: 'createElement'
      }
    ]
  ]
});
```

#### Output

```ts
import React from 'react';
var __jsx = React.createElement;
const a = () => __jsx(React.Fragment, null, 'hello');
```

## Rspack Alternative

Based on the above specification, we can use rspack's [`builtin:swc-loader`](https://rspack.rs/zh/guide/features/builtin-swc-loader) plugin to implement this plugin. Rspack provides native SWC integration with optimized performance and better tree-shaking capabilities.

### Coverage Analysis

**✅ Full Coverage**: Rspack's builtin SWC loader completely satisfies all JSX Pragma plugin requirements.

| Feature           | JSX Pragma Plugin | Rspack builtin:swc-loader                     | Status |
| ----------------- | ----------------- | --------------------------------------------- | ------ |
| Automatic Runtime | ✅                | ✅ `jsc.transform.react.runtime: 'automatic'` | ✅     |
| Classic Runtime   | ✅                | ✅ `jsc.transform.react.runtime: 'classic'`   | ✅     |
| Custom Pragma     | ✅                | ✅ `jsc.transform.react.pragma`               | ✅     |
| Fragment Support  | ✅                | ✅ `jsc.transform.react.pragmaFrag`           | ✅     |
| CommonJS Support  | ✅                | ✅ Native SWC support                         | ✅     |
| Import Detection  | ✅                | ✅ SWC scope analysis                         | ✅     |
| TypeScript/TSX    | ✅                | ✅ Native parser support                      | ✅     |

### Configuration Mapping

```js
// JSX Pragma Plugin Configuration
{
  importSource: 'react',
  runtime: 'automatic',
  pragma: 'React.createElement',
  pragmaFrag: 'React.Fragment',
  throwIfNamespace: true,
  development: false,
  useBuiltins: true,
  refresh: false
}

// Equivalent Rspack Configuration
{
  jsc: {
    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment',
        throwIfNamespace: true,
        development: false,
        useBuiltins: true,
        refresh: false
      }
    }
  }
}
```

### Complete Rspack Setup

```js
// rspack.config.mjs
export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: [/node_modules/],
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true
              },
              transform: {
                react: {
                  importSource: 'react',
                  runtime: 'automatic',
                  pragma: 'React.createElement',
                  pragmaFrag: 'React.Fragment',
                  throwIfNamespace: true,
                  development: false,
                  useBuiltins: true,
                  refresh: false
                }
              }
            }
          }
        },
        type: 'javascript/auto'
      }
    ]
  }
};
```

### Migration Guide

1. **Replace loader**: `@shuvi/swc-loader` → `builtin:swc-loader`
2. **Update config**: Move options under `jsc.transform.react`
3. **Remove dependencies**: No need for custom JSX Pragma plugin
4. **Enjoy performance**: Immediate performance improvements

**Recommendation**: Use Rspack's builtin SWC loader for new projects and consider migrating existing projects for better performance and maintainability.
