# Disallow Re-export All in Page Plugin

## Overview

The Disallow Re-export All in Page plugin is a SWC transform that prevents the use of `export * from '...'` syntax in page files. This plugin enforces better export practices by requiring explicit named exports instead of wildcard re-exports, which helps with tree-shaking and code clarity.

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
  isPageFile: true // enables the plugin for page files
});
```

### Loader Usage

Use the `@shuvi/swc-loader` to enable this plugin in your build pipeline.

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
            isPageFile: true
          }
        }
      }
    ]
  }
};
```

## API

### Configuration

| Option       | Type      | Default | Description                             |
| ------------ | --------- | ------- | --------------------------------------- |
| `isPageFile` | `boolean` | `false` | Whether the current file is a page file |

## Behavior Specification

### 1. Error Detection

The plugin detects and throws an error when encountering `export * from '...'` syntax in page files.

#### Error Message

When a wildcard re-export is detected, the plugin throws an error with the following message:

```
Using `export * from '...'` in a page is disallowed. Please use `export { default } from '...'` instead.
```

### 2. Conditional Activation

The plugin only activates when `isPageFile` is set to `true`. This allows the same transform pipeline to be used for both page and non-page files.

### 3. Recommended Alternative

Instead of using wildcard re-exports, the plugin recommends using explicit named exports:

- **Disallowed**: `export * from './other-page'`
- **Recommended**: `export { default } from './other-page'`

## Test Cases

Please refer to the [test cases](../../../src/swc/__tests__/plugins/disallow-re-export-all-in-page.test.ts) for detailed examples.

### 1. Wildcard Re-export Error

**Description**: Tests that the plugin throws an error when encountering `export * from '...'` syntax in a page file.

#### Input

```ts
export * from 'react';
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isPageFile: true
});
```

#### Expected Behavior

The transform should throw an error with the message:

```
Using `export * from '...'` in a page is disallowed. Please use `export { default } from '...'` instead.
```

### 2. Named Re-export Allowed

**Description**: Tests that named re-exports are allowed and not transformed.

#### Input

```ts
export { default, getStaticProps, getStaticPaths } from './other-page';
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isPageFile: true
});
```

#### Output

```ts
export { default, getStaticProps, getStaticPaths } from './other-page';
```

### 3. Plugin Inactive for Non-page Files

**Description**: Tests that the plugin does not activate when `isPageFile` is false.

#### Input

```ts
export * from 'react';
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isPageFile: false
});
```

#### Output

```ts
export * from 'react';
```

### 4. Regular Exports Unaffected

**Description**: Tests that regular export statements are not affected by the plugin.

#### Input

```ts
export default function Page() {
  return <div>Hello World</div>;
}

export const loader = async () => {
  return { data: 'test' };
};
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isPageFile: true
});
```

#### Output

```ts
export default function Page() {
  return <div>Hello World</div>;
}

export const loader = async () => {
  return { data: 'test' };
};
```

## Rspack Migration

### Before

When using `@shuvi/compiler`, the disallow re-export all functionality is provided through the built-in SWC transform:

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isPageFile: true // enables the plugin for page files
});
```

### After

When migrating to Rspack, you can achieve the same disallow re-export all functionality using Rspack's `builtin:swc-loader` with custom SWC plugins. Here are the migration approaches:

#### Option 1: Using SWC Wasm Plugin (Recommended)

Create a custom SWC plugin that implements the disallow re-export all transformation:

```js title="rspack.config.mjs"
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
                tsx: true,
              },
              experimental: {
                plugins: [
                  [
                    '@your-org/swc-plugin-disallow-re-export-all',
                    {
                      isPageFile: true // enables the plugin for page files
                    }
                  ]
                ]
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

#### Option 2: Custom SWC Plugin Implementation

If you need to implement the exact same behavior as the original plugin, create a custom SWC Wasm plugin:

##### Step 1: Create the SWC Plugin Project

```bash
# Create a new directory for your plugin
mkdir swc-plugin-disallow-re-export-all
cd swc-plugin-disallow-re-export-all

# Initialize a new Rust project
cargo init --lib
```

##### Step 2: Configure Cargo.toml

```toml title="Cargo.toml"
[package]
name = "swc-plugin-disallow-re-export-all"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
swc_atoms = "0.5"
swc_common = "0.32"
swc_ecmascript = "0.200"
```

##### Step 3: Implement the Plugin

```rust title="src/lib.rs"
use swc_atoms::JsWord;
use swc_ecmascript::ast::{ExportAll, Module, ModuleItem};
use swc_ecmascript::visit::{Fold, FoldWith};

pub fn disallow_re_export_all(is_page_file: bool) -> impl Fold {
    DisallowReExportAll { is_page_file }
}

#[derive(Debug)]
struct DisallowReExportAll {
    is_page_file: bool,
}

impl Fold for DisallowReExportAll {
    fn fold_module(&mut self, module: Module) -> Module {
        if !self.is_page_file {
            return module;
        }

        let mut has_error = false;
        let mut error_message = String::new();

        // Check for export * statements
        for item in &module.body {
            if let ModuleItem::ModuleDecl(module_decl) = item {
                if let swc_ecmascript::ast::ModuleDecl::ExportAll(export_all) = module_decl {
                    has_error = true;
                    error_message = format!(
                        "Using `export * from '{}'` in a page is disallowed. Please use `export {{ default }} from '{}'` instead.",
                        export_all.src.value, export_all.src.value
                    );
                    break;
                }
            }
        }

        if has_error {
            panic!("{}", error_message);
        }

        module
    }
}

// SWC Plugin Entry Point
#[no_mangle]
pub fn create_plugin() -> *mut swc_common::plugin::Plugin {
    let plugin = swc_common::plugin::Plugin::new(
        "disallow-re-export-all".to_string(),
        Box::new(|config| {
            let is_page_file = config
                .get("isPageFile")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            
            Box::new(disallow_re_export_all(is_page_file))
        }),
    );
    
    Box::into_raw(plugin)
}
```

##### Step 4: Build the Plugin

```bash
# Build for wasm32-unknown-unknown target
cargo build --target wasm32-unknown-unknown --release

# The compiled plugin will be at:
# target/wasm32-unknown-unknown/release/swc_plugin_disallow_re_export_all.wasm
```

##### Step 5: Create NPM Package

```json title="package.json"
{
  "name": "@your-org/swc-plugin-disallow-re-export-all",
  "version": "0.1.0",
  "description": "SWC plugin for disallowing re-export all in page files",
  "main": "index.js",
  "files": [
    "index.js",
    "swc_plugin_disallow_re_export_all.wasm"
  ],
  "scripts": {
    "build": "cargo build --target wasm32-unknown-unknown --release && cp target/wasm32-unknown-unknown/release/swc_plugin_disallow_re_export_all.wasm ."
  },
  "keywords": ["swc", "plugin", "re-export", "page"],
  "author": "Your Name",
  "license": "MIT"
}
```

```js title="index.js"
const path = require('path');

module.exports = function() {
  return {
    name: 'disallow-re-export-all',
    setup(build) {
      // This is the entry point for the SWC plugin
      return path.join(__dirname, 'swc_plugin_disallow_re_export_all.wasm');
    }
  };
};
```

##### Step 6: Publish and Install

```bash
# Publish to npm (or your private registry)
npm publish

# In your project, install the plugin
npm install @your-org/swc-plugin-disallow-re-export-all
```

##### Step 7: Configure Rspack

```js title="rspack.config.mjs"
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
                tsx: true,
              },
              experimental: {
                plugins: [
                  [
                    '@your-org/swc-plugin-disallow-re-export-all',
                    {
                      isPageFile: true // enables the plugin for page files
                    }
                  ]
                ]
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

##### Step 8: Alternative - Local Development Setup

If you want to develop and test locally without publishing:

```js title="rspack.config.mjs"
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
                tsx: true,
              },
              experimental: {
                plugins: [
                  [
                    path.join(__dirname, './swc-plugin-disallow-re-export-all/swc_plugin_disallow_re_export_all.wasm'),
                    {
                      isPageFile: true
                    }
                  ]
                ]
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

##### Development Workflow

```bash
# 1. Build the plugin
cd swc-plugin-disallow-re-export-all
cargo build --target wasm32-unknown-unknown --release

# 2. Copy the wasm file to your project
cp target/wasm32-unknown-unknown/release/swc_plugin_disallow_re_export_all.wasm ../your-project/

# 3. Test the configuration
cd ../your-project
npm run build
```

##### Troubleshooting

1. **Plugin Version Compatibility**: Ensure your SWC plugin version matches the SWC version used by Rspack
2. **WASM Loading Issues**: Make sure the WASM file path is correct and accessible
3. **Build Errors**: Check that all Rust dependencies are properly configured
4. **Performance**: Monitor build times and optimize if needed

##### Testing Your Plugin

Create a test file to verify the transformation:

```ts title="test.ts"
// This should throw an error when isPageFile is true
export * from 'react';

// This should be allowed
export { default } from './other-page';
```

Expected behavior:
- When `isPageFile: true`: The first line should throw an error
- When `isPageFile: false`: Both lines should be allowed

### Migration Benefits

1. **Performance**: Rspack's `builtin:swc-loader` is implemented in Rust, providing better performance than JavaScript-based solutions
2. **Native Integration**: Direct integration with Rspack's build pipeline
3. **Flexibility**: Multiple approaches available depending on your specific needs
4. **Future-Proof**: Built on SWC's stable plugin architecture

### Configuration Comparison

| Feature | @shuvi/compiler | Rspack Migration |
|---------|-----------------|------------------|
| Page File Detection | `isPageFile: true` | Plugin options |
| Error Message | Custom error message | Same error message |
| Conditional Activation | Based on `isPageFile` | Same behavior |
| Performance | Good | Better (Rust implementation) |

### TypeScript Support

For TypeScript projects, ensure proper type definitions:

```ts title="rspack.config.ts"
import type { SwcLoaderOptions } from '@rspack/core';

export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              experimental: {
                plugins: [
                  [
                    '@your-org/swc-plugin-disallow-re-export-all',
                    {
                      isPageFile: true
                    }
                  ]
                ]
              }
            }
          } satisfies SwcLoaderOptions
        }
      }
    ]
  }
};
```

### Advanced Configuration

#### Setting Cache Directory

When using SWC plugins, you can configure the cache directory:

```js title="rspack.config.mjs"
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
                tsx: true,
              },
              experimental: {
                cacheRoot: path.join(__dirname, './node_modules/.cache/swc'),
                plugins: [
                  [
                    '@your-org/swc-plugin-disallow-re-export-all',
                    {
                      isPageFile: true
                    }
                  ]
                ]
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

#### Multiple Plugin Configuration

You can combine multiple SWC plugins in the same configuration:

```js title="rspack.config.mjs"
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
                tsx: true,
              },
              experimental: {
                plugins: [
                  [
                    '@your-org/swc-plugin-disallow-re-export-all',
                    {
                      isPageFile: true
                    }
                  ],
                  [
                    '@swc/plugin-remove-console',
                    {
                      exclude: ['error'],
                    },
                  ],
                ]
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
