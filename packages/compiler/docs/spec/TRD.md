# @shuvi/compiler Specification

## Overview

The `@shuvi/compiler` package is the core compilation engine for the Shuvi framework, providing high-performance JavaScript/TypeScript compilation using SWC (Speedy Web Compiler).

## Getting Started

### Installation

```bash
# Install the compiler package
pnpm add @shuvi/compiler
```

## Usage

### Basic Transform

```javascript
import { transform } from '@shuvi/compiler';

// Input
const sourceCode = `
  interface User {
    name: string;
    age: number;
  }
  
  const user: User = {
    name: "John",
    age: 30
  };
  
  console.log(user.name);
`;

// Transform
const result = await transform(sourceCode, {
  jsc: {
    parser: { syntax: 'typescript' },
    target: 'es2020'
  }
});

// Output
console.log(result.code);
// const user = { name: "John", age: 30 }; console.log(user.name);
```

### React JSX Transform

```javascript
import { transform } from '@shuvi/compiler';

// Input
const jsxCode = `
  import React from 'react';
  
  function Greeting({ name }) {
    return <h1>Hello, {name}!</h1>;
  }
  
  export default Greeting;
`;

// Transform
const result = await transform(jsxCode, {
  jsc: {
    parser: { syntax: 'typescript', tsx: true },
    transform: {
      react: {
        runtime: 'automatic',
        importSource: 'react'
      }
    }
  }
});

// Output
console.log(result.code);
// import { jsx as _jsx } from "react/jsx-runtime";
// function Greeting({ name }) {
//   return _jsx("h1", { children: "Hello, " + name + "!" });
// }
// export default Greeting;
```

### Synchronous Transform

```javascript
import { transformSync } from '@shuvi/compiler';

// Input
const sourceCode = 'const x = 1; const y = 2; console.log(x + y);';

// Transform
const result = transformSync(sourceCode, {
  jsc: { target: 'es2020' },
  minify: true
});

// Output
console.log(result.code);
// var x=1,y=2;console.log(x+y);
```

### Conditional Compilation

```javascript
import { transform } from '@shuvi/compiler';

// Conditional compilation based on environment
const config = {
  jsc: {
    target: process.env.NODE_ENV === 'production' ? 'es5' : 'es2020'
  },
  removeConsole: process.env.NODE_ENV === 'production',
  minify: process.env.NODE_ENV === 'production'
};

const result = await transform(sourceCode, config);
```

## API Reference

### Transform Functions

#### `transform(src: string | Buffer | ModuleObject, options?: TransformOptions): Promise<TransformResult>`

Asynchronously transforms source code using SWC.

**Parameters:**

- `src`: Source code as string, Buffer, or module object
  - `string`: Raw source code
  - `Buffer`: Source code as buffer
  - `ModuleObject`: Module object with `code` and optional `map` properties
- `options`: Configuration options (see TransformOptions)

**Returns:** Promise resolving to transformation result

**Throws:**
- `Error`: When SWC binary cannot be loaded (process exits with code 1)
- `Error`: When compilation fails

**Example:**

```javascript
const result = await transform('const x = 1;', {
  jsc: { target: 'es2020' },
  minify: true
});
console.log(result.code); // "var x=1;"
```

#### `transformSync(src: string | Buffer | ModuleObject, options?: TransformOptions): TransformResult`

Synchronously transforms source code using SWC.

**Parameters:**

- `src`: Source code as string, Buffer, or module object
- `options`: Configuration options (see TransformOptions)

**Returns:** Transformation result

**Throws:**
- `Error`: When SWC binary cannot be loaded (process exits with code 1)
- `Error`: When compilation fails

**Example:**

```javascript
const result = transformSync('const x = 1;', {
  jsc: { target: 'es2020' }
});
console.log(result.code); // "var x=1;"
```

### Type Definitions

#### TransformOptions

```typescript
interface TransformOptions {
  // JSC (JavaScript Compiler) options
  jsc?: {
    parser?: {
      syntax?: 'ecmascript' | 'typescript'; // Default: 'ecmascript'
      jsx?: boolean; // Default: false
      tsx?: boolean; // Default: false
      dynamicImport?: boolean; // Default: false
    };
    transform?: {
      react?: ReactTransformOptions;
      optimizer?: OptimizerOptions;
    };
    target?: string; // Default: 'es2020'
  };

  // Module options
  module?: {
    type?: 'es6' | 'commonjs'; // Default: 'es6'
  };

  // Environment options
  env?: {
    targets?: Record<string, string>; // Browser targets for polyfills
  };

  // Minification
  minify?: boolean; // Default: false

  // Source maps
  sourceMaps?: boolean; // Default: false

  // Plugin configurations
  styledComponents?: StyledComponentsOptions;
  emotion?: EmotionOptions;
  modularizeImports?: ModularizeImportsOptions;
  removeConsole?: boolean; // Default: false
  isServer?: boolean; // Default: false
  isPageFile?: boolean; // Default: false
  pagePickLoader?: boolean; // Default: false
  reactRemoveProperties?: ReactRemovePropertiesOptions;
  optimizeHookDestructuring?: OptimizeHookDestructuringOptions;
  autoCSSModules?: AutoCSSModulesOptions;
  disallowReExportAll?: DisallowReExportAllOptions;
}
```


### Plugin Type Definitions

#### StyledComponentsOptions

```typescript
interface StyledComponentsOptions {
  displayName?: boolean;
  fileName?: boolean;
  transpileTemplateLiterals?: boolean;
  ssr?: boolean;
  componentId?: string;
  displayNamePrefix?: string;
}
```

#### EmotionOptions

```typescript
interface EmotionOptions {
  enabled?: boolean;
  sourcemap?: boolean;
  autoLabel?: boolean;
  labelFormat?: string;
  importSource?: string;
  development?: boolean;
}
```

#### ModularizeImportsOptions

```typescript
interface ModularizeImportsOptions {
  [importSource: string]: {
    transform: string;
    skipDefaultConversion?: boolean;
    preventFullImport?: boolean;
  };
}
```

#### ReactRemovePropertiesOptions

```typescript
interface ReactRemovePropertiesOptions {
  properties?: string[];
  enabled?: boolean;
  patterns?: RegExp[];
  exclude?: string[];
}
```

#### OptimizeHookDestructuringOptions

```typescript
interface OptimizeHookDestructuringOptions {
  enabled?: boolean;
  hooks?: string[];
  exclude?: string[];
}
```

#### AutoCSSModulesOptions

```typescript
interface AutoCSSModulesOptions {
  enabled?: boolean;
  extensions?: string[];
  modulePattern?: string;
  exclude?: string[];
}
```

#### DisallowReExportAllOptions

```typescript
interface DisallowReExportAllOptions {
  enabled?: boolean;
  errorMessage?: string;
  allowPatterns?: string[];
  exclude?: string[];
}
```

## Architecture

#### Core Components

1. **SWC Integration Layer** (`src/swc/index.js`)

   - Platform-specific binary loading
   - Cross-platform compatibility (Darwin, Linux, Windows)
   - Architecture support (x64, arm64, ia32)

2. **Transform API** (`src/index.ts`)
   - `transform()` - Asynchronous transformation
   - `transformSync()` - Synchronous transformation

#### Binary Distribution

The package includes optional dependencies for platform-specific SWC binaries:

- **Darwin**: `@shuvi/swc-darwin-arm64`, `@shuvi/swc-darwin-x64`
- **Linux**: `@shuvi/swc-linux-arm-gnueabihf`, `@shuvi/swc-linux-arm64-gnu`, `@shuvi/swc-linux-arm64-musl`, `@shuvi/swc-linux-x64-gnu`, `@shuvi/swc-linux-x64-musl`
- **Windows**: `@shuvi/swc-win32-arm64-msvc`, `@shuvi/swc-win32-ia32-msvc`, `@shuvi/swc-win32-x64-msvc`

### Performance Characteristics

- **Compilation Speed**: Significantly faster than Babel (10-100x faster)
- **Memory Usage**: Optimized for large codebases
- **Parallel Processing**: Support for concurrent transformations
- **Caching**: Built-in caching mechanisms

### Compilation Modes

#### Node.js Mode

- **Target**: Current Node.js version
- **Module System**: ESM or CommonJS
- **Optimizations**: Node.js-specific optimizations
- **Type Checking**: Enhanced for server-side code

#### Browser Mode

- **Target**: ES5 (configurable)
- **Module System**: ESM or CommonJS
- **Optimizations**: Browser-specific optimizations
- **Type Checking**: Enhanced for client-side code

### Error Handling

The compiler provides comprehensive error handling:

- **Binary Loading Errors**: Graceful fallback and detailed error messages
- **Syntax Errors**: Detailed parsing error information
- **Plugin Errors**: Plugin-specific error handling
- **Memory Management**: Efficient memory usage for large codebases

### Development Workflow

#### Local Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Development mode with watch
pnpm dev
```

#### Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:integration
```

#### Debugging

```bash
# Enable debug logging
DEBUG=shuvi:compiler npm run build

# Run with verbose output
npm run build -- --verbose
```
