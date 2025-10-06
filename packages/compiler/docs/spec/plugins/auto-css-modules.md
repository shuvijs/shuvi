# Auto CSS Modules Plugin

## Overview

The Auto CSS Modules plugin is a SWC transform that automatically detects CSS file imports with named specifiers and appends a query parameter to enable CSS modules processing. The plugin intelligently distinguishes between named imports (which should be transformed) and side-effect imports (which should remain unchanged).

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
  cssModuleFlag: 'cssmodules' // optional, defaults to 'cssmodules'
});
```

### Loader Usage

Use the `@shuvi/swc-loader` to transform CSS imports in your build pipeline.

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
            cssModuleFlag: 'cssmodules'
          }
        }
      }
    ]
  }
};
```

## API

### Configuration

| Option          | Type     | Default        | Description                                       |
| --------------- | -------- | -------------- | ------------------------------------------------- |
| `cssModuleFlag` | `string` | `'cssmodules'` | The query parameter flag to append to CSS imports |

## Behavior Specification

### 1. CSS Modules Transformation

The plugin transforms named imports of CSS files by appending a query parameter.

#### Supported CSS Extensions

- `.css` - Standard CSS files
- `.less` - Less preprocessor files
- `.scss` - SCSS preprocessor files
- `.sass` - Sass preprocessor files

#### Transformation Rules

- **Named Imports**: Only imports with named specifiers are transformed
- **Query Parameter**: Appends `?cssmodules` by default, or custom flag if specified
- **File Extension Detection**: Only processes files with supported CSS extensions

### 2. Side-effect Imports

Side-effect imports (imports without named specifiers) are **not transformed** and remain unchanged.

### 3. Non-CSS Imports

Imports of non-CSS files are **never transformed**, regardless of import type.

## Test Cases

Please refer to the [test cases](../../../src/swc/__tests__/plugins/auto-css-modules.test.ts) for detailed examples.

### 1. Basic CSS Modules Transformation

**Description**: Tests automatic transformation of named CSS imports with default flag for all supported CSS extensions.

**Expected Behavior**: Named imports of CSS files (`.css`, `.less`, `.scss`, `.sass`) should be transformed by appending `?cssmodules` query parameter to enable CSS modules processing.

#### Input

```ts
import styles from 'a.css';
import styles from 'a.less';
import styles from 'a.scss';
import styles from 'a.sass';
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  cssModuleFlag: 'cssmodules' // default value
});
```

#### Output

```ts
import styles from 'a.css?cssmodules';
import styles from 'a.less?cssmodules';
import styles from 'a.scss?cssmodules';
import styles from 'a.sass?cssmodules';
```

### 2. Custom CSS Module Flag

**Description**: Tests custom flag configuration to override the default 'cssmodules' flag.

**Expected Behavior**: When custom `cssModuleFlag` is provided, the plugin should use that flag instead of the default `cssmodules` flag.

#### Input

```ts
import styles from 'a.css';
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  cssModuleFlag: 'foo'
});
```

#### Output

```ts
import styles from 'a.css?foo';
```

### 3. Side-effect CSS Imports

**Description**: Tests that side-effect imports of CSS files remain unchanged and are not transformed.

**Expected Behavior**: Side-effect imports of CSS files should remain unchanged without any query parameter transformation.

#### Input

```ts
import 'a.css';
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  cssModuleFlag: 'cssmodules'
});
```

#### Output

```ts
import 'a.css';
```

### 4. Non-CSS Imports

**Description**: Tests that imports of non-CSS files are never transformed, regardless of import type.

**Expected Behavior**: Imports of non-CSS files should never be transformed, regardless of import type (named or side-effect).

#### Input

```ts
import a from 'a';
import a from 'a.js';
import 'a';
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  cssModuleFlag: 'cssmodules'
});
```

#### Output

```ts
import a from 'a';
import a from 'a.js';
import 'a';
```

## Rspack Migration

### Before

When using `@shuvi/compiler`, the auto CSS modules functionality is provided through the built-in SWC transform:

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  cssModuleFlag: 'cssmodules' // optional, defaults to 'cssmodules'
});
```

### After

When migrating to Rspack, you can achieve the same auto CSS modules functionality using Rspack's `builtin:swc-loader` with custom SWC plugins. Here are the migration approaches:
