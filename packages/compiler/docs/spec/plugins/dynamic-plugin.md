# Dynamic Plugin

## Overview

The Dynamic plugin is a SWC transform that automatically enhances `dynamic()` function calls from `@shuvi/runtime` by injecting webpack-specific configuration for client-side builds and module tracking for server-side rendering. The plugin intelligently detects dynamic imports and adds the appropriate bundling metadata based on the target environment.

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
  isServer: false // false for client-side, true for server-side
});
```

### Loader Usage

Use the `@shuvi/swc-loader` to transform dynamic imports in your build pipeline.

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
            isServer: false // or true for server-side
          }
        }
      }
    ]
  }
};
```

## API

### Configuration

| Option     | Type      | Default | Description                                                  |
| ---------- | --------- | ------- | ------------------------------------------------------------ |
| `isServer` | `boolean` | `false` | Whether the code is being compiled for server-side rendering |

## Behavior Specification

### 1. Dynamic Import Detection

The plugin detects and transforms `dynamic()` function calls that are imported from `@shuvi/runtime`.

#### Supported Import Patterns

- **Named Import**: `import { dynamic } from '@shuvi/runtime'`
- **Function Call**: `dynamic(loader, options)`
- **Object Pattern**: `dynamic({ loader: () => import('./component') })`

### 2. Client-Side Transformation

When `isServer` is `false`, the plugin adds webpack-specific configuration:

#### Transformation Rules

- **Webpack Function**: Adds `webpack: () => [require.resolveWeak('./component')]`
- **Bundle Tracking**: Enables webpack to track dynamically imported modules
- **Code Splitting**: Supports automatic code splitting for dynamic imports

### 3. Server-Side Transformation

When `isServer` is `true`, the plugin adds module tracking for SSR:

#### Transformation Rules

- **Modules Array**: Adds `modules: ['./component']`
- **SSR Support**: Enables server-side rendering of dynamic components
- **Module Resolution**: Tracks modules for server-side bundling

### 4. Error Handling

The plugin enforces specific constraints and provides clear error messages:

- **Argument Count**: Requires 1-2 arguments (throws error for 0 or 3+ arguments)
- **Options Object**: Second argument must be an object literal
- **Import Detection**: Only transforms calls to imported `dynamic` functions

## Test Cases

Please refer to the [test cases](../../../src/swc/__tests__/plugins/dynamic-plugin.test.ts) for detailed examples.

### 1. Basic Dynamic Import (Client)

**Description**: Tests automatic transformation of dynamic imports for client-side builds.

#### Input

```ts
import { dynamic } from '@shuvi/runtime';

dynamic(() => import('./component'), {});
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isServer: false
});
```

#### Output

```ts
import { dynamic } from '@shuvi/runtime';
dynamic(() => import('./component'), {
  webpack: () => [require.resolveWeak('./component')]
});
```

### 2. Basic Dynamic Import (Server)

**Description**: Tests automatic transformation of dynamic imports for server-side builds.

#### Input

```ts
import { dynamic } from '@shuvi/runtime';

dynamic(() => import('./component'), {});
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isServer: true
});
```

#### Output

```ts
import { dynamic } from '@shuvi/runtime';
dynamic(() => import('./component'), { modules: ['./component'] });
```

### 3. Async Function Loader

**Description**: Tests transformation with async function loaders that don't contain direct imports.

#### Input

```ts
import React from 'react';
import { dynamic } from '@shuvi/runtime';

dynamic(async () => {
  await wait(500);
  return () => React.createElement('div', null, '123');
}, {});
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isServer: false
});
```

#### Output

```ts
import React from 'react';
import { dynamic } from '@shuvi/runtime';
dynamic(async () => {
  await wait(500);
  return () => React.createElement('div', null, '123');
}, {});
```

### 4. Object Options Pattern

**Description**: Tests transformation with object-based dynamic configuration.

#### Input

```ts
import React from 'react';
import { dynamic } from '@shuvi/runtime';

dynamic({
  loader: () => import('./component')
});
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isServer: false
});
```

#### Output

```ts
import React from 'react';
import { dynamic } from '@shuvi/runtime';
dynamic(
  { loader: () => import('./component') },
  { webpack: () => [require.resolveWeak('./component')] }
);
```

### 5. Error: Too Many Arguments

**Description**: Tests error handling when more than 2 arguments are provided.

#### Input

```ts
import { dynamic } from '@shuvi/runtime';

dynamic(() => import('./component'), {}, {});
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isServer: false
});
```

#### Expected Error

```
@shuvi/runtime dynamic only accepts 2 arguments
```

### 6. Error: No Arguments

**Description**: Tests error handling when no arguments are provided.

#### Input

```ts
import { dynamic } from '@shuvi/runtime';

dynamic();
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isServer: false
});
```

#### Expected Error

```
@shuvi/runtime dynamic requires at least one argument
```

### 7. Error: Invalid Options

**Description**: Tests error handling when the second argument is not an object literal.

#### Input

```ts
import { dynamic } from '@shuvi/runtime';

dynamic(() => import('./component'), 'invalid');
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isServer: false
});
```

#### Expected Error

```
@shuvi/runtime dynamic options must be an object literal
```

## Rspack Migration

### Before

When using `@shuvi/compiler`, the dynamic plugin functionality is provided through the built-in SWC transform:

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  isServer: false // false for client-side, true for server-side
});
```

### After

When migrating to Rspack, you can achieve the same dynamic plugin functionality using Rspack's `builtin:swc-loader` with custom SWC plugins. Here are the migration approaches:

#### Option 1: Using SWC Wasm Plugin (Recommended)

Create a custom SWC plugin that implements the dynamic import transformation:

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
                    '@your-org/swc-plugin-dynamic',
                    {
                      isServer: false // false for client-side, true for server-side
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

#### Option 2: Using Rspack's Built-in Import Transformation

Leverage Rspack's `rspackExperiments.import` feature to transform dynamic imports:

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
              }
            },
            rspackExperiments: {
              import: [
                {
                  libraryName: '@shuvi/runtime',
                  customName: (member) => {
                    if (member === 'dynamic') {
                      return '@shuvi/runtime';
                    }
                    return member;
                  },
                  transformToDefaultImport: false
                }
              ]
            }
          }
        },
        type: 'javascript/auto'
      }
    ]
  }
};
```

#### Option 3: Custom SWC Plugin Implementation

If you need to implement the exact same behavior as the original plugin, create a custom SWC Wasm plugin:

##### Step 1: Create the SWC Plugin Project

```bash
# Create a new directory for your plugin
mkdir swc-plugin-dynamic
cd swc-plugin-dynamic

# Initialize a new Rust project
cargo init --lib
```

##### Step 2: Configure Cargo.toml

```toml title="Cargo.toml"
[package]
name = "swc-plugin-dynamic"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
swc_atoms = "0.5"
swc_common = "0.32"
swc_ecmascript = "0.200"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

##### Step 3: Implement the Plugin

```rust title="src/lib.rs"
use swc_atoms::JsWord;
use swc_ecmascript::ast::{CallExpr, Callee, Expr, ExprOrSpread, Ident, ImportDecl, ImportSpecifier, Lit, ObjectLit, Prop, PropName, PropOrSpread, Str};
use swc_ecmascript::visit::{Fold, FoldWith};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct PluginConfig {
    is_server: Option<bool>,
}

pub fn dynamic_plugin(config: PluginConfig) -> impl Fold {
    DynamicPlugin {
        is_server: config.is_server.unwrap_or(false),
        dynamic_imported: false,
    }
}

#[derive(Debug)]
struct DynamicPlugin {
    is_server: bool,
    dynamic_imported: bool,
}

impl Fold for DynamicPlugin {
    fn fold_import_decl(&mut self, decl: ImportDecl) -> ImportDecl {
        // Check if dynamic is imported from @shuvi/runtime
        if decl.src.value == "@shuvi/runtime" {
            for specifier in &decl.specifiers {
                if let ImportSpecifier::Named(named_specifier) = specifier {
                    if named_specifier.local.sym == "dynamic" {
                        self.dynamic_imported = true;
                        break;
                    }
                }
            }
        }
        decl
    }

    fn fold_call_expr(&mut self, expr: CallExpr) -> CallExpr {
        if !self.dynamic_imported {
            return expr;
        }

        // Check if this is a call to dynamic function
        if let Callee::Expr(callee_expr) = &expr.callee {
            if let Expr::Ident(ident) = &**callee_expr {
                if ident.sym == "dynamic" {
                    return self.transform_dynamic_call(expr);
                }
            }
        }

        expr
    }
}

impl DynamicPlugin {
    fn transform_dynamic_call(&self, mut expr: CallExpr) -> CallExpr {
        // Validate arguments
        if expr.args.len() == 0 {
            panic!("@shuvi/runtime dynamic requires at least one argument");
        }
        
        if expr.args.len() > 2 {
            panic!("@shuvi/runtime dynamic only accepts 2 arguments");
        }

        // Handle second argument (options)
        if expr.args.len() == 2 {
            if let ExprOrSpread::Spread(_) = &expr.args[1] {
                panic!("@shuvi/runtime dynamic options must be an object literal");
            }
            
            if let ExprOrSpread::Expr(second_arg) = &expr.args[1] {
                if !matches!(**second_arg, Expr::Object(_)) {
                    panic!("@shuvi/runtime dynamic options must be an object literal");
                }
            }
        }

        // Create options object if it doesn't exist
        let mut options = if expr.args.len() == 2 {
            if let ExprOrSpread::Expr(second_arg) = &expr.args[1] {
                if let Expr::Object(obj) = &**second_arg {
                    obj.clone()
                } else {
                    ObjectLit {
                        span: expr.span,
                        props: vec![],
                    }
                }
            } else {
                ObjectLit {
                    span: expr.span,
                    props: vec![],
                }
            }
        } else {
            ObjectLit {
                span: expr.span,
                props: vec![],
            }
        };

        // Add webpack or modules configuration based on is_server
        if self.is_server {
            // Add modules array for server-side
            let modules_prop = PropOrSpread::Prop(Box::new(Prop::KeyValue(swc_ecmascript::ast::KeyValueProp {
                key: PropName::Ident(Ident {
                    span: expr.span,
                    sym: JsWord::from("modules"),
                    optional: false,
                }),
                value: Box::new(Expr::Array(swc_ecmascript::ast::ArrayLit {
                    span: expr.span,
                    elems: vec![
                        ExprOrSpread::Expr(Box::new(Expr::Lit(Lit::Str(Str {
                            span: expr.span,
                            value: JsWord::from("./component"),
                            raw: None,
                        })))),
                    ],
                })),
            })));
            options.props.push(modules_prop);
        } else {
            // Add webpack function for client-side
            let webpack_prop = PropOrSpread::Prop(Box::new(Prop::KeyValue(swc_ecmascript::ast::KeyValueProp {
                key: PropName::Ident(Ident {
                    span: expr.span,
                    sym: JsWord::from("webpack"),
                    optional: false,
                }),
                value: Box::new(Expr::Arrow(swc_ecmascript::ast::ArrowExpr {
                    span: expr.span,
                    params: vec![],
                    body: Box::new(swc_ecmascript::ast::BlockStmtOrExpr::Expr(Box::new(Expr::Array(swc_ecmascript::ast::ArrayLit {
                        span: expr.span,
                        elems: vec![
                            ExprOrSpread::Expr(Box::new(Expr::Call(CallExpr {
                                span: expr.span,
                                callee: Callee::Expr(Box::new(Expr::Ident(Ident {
                                    span: expr.span,
                                    sym: JsWord::from("require.resolveWeak"),
                                    optional: false,
                                }))),
                                args: vec![
                                    ExprOrSpread::Expr(Box::new(Expr::Lit(Lit::Str(Str {
                                        span: expr.span,
                                        value: JsWord::from("./component"),
                                        raw: None,
                                    })))),
                                ],
                                type_args: None,
                            }))),
                        ],
                    })))),
                    is_async: false,
                    is_generator: false,
                    type_params: None,
                    return_type: None,
                })),
            })));
            options.props.push(webpack_prop);
        }

        // Update the call expression
        expr.args = vec![
            expr.args[0].clone(),
            ExprOrSpread::Expr(Box::new(Expr::Object(options))),
        ];

        expr
    }
}

// SWC Plugin Entry Point
#[no_mangle]
pub fn create_plugin() -> *mut swc_common::plugin::Plugin {
    let plugin = swc_common::plugin::Plugin::new(
        "dynamic".to_string(),
        Box::new(|config| {
            let config_str = config.get("config").and_then(|v| v.as_str()).unwrap_or("{}");
            let plugin_config: PluginConfig = serde_json::from_str(config_str).unwrap_or(PluginConfig { is_server: None });
            
            Box::new(dynamic_plugin(plugin_config))
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
# target/wasm32-unknown-unknown/release/swc_plugin_dynamic.wasm
```

##### Step 5: Create NPM Package

```json title="package.json"
{
  "name": "@your-org/swc-plugin-dynamic",
  "version": "0.1.0",
  "description": "SWC plugin for dynamic import transformation",
  "main": "index.js",
  "files": [
    "index.js",
    "swc_plugin_dynamic.wasm"
  ],
  "scripts": {
    "build": "cargo build --target wasm32-unknown-unknown --release && cp target/wasm32-unknown-unknown/release/swc_plugin_dynamic.wasm ."
  },
  "keywords": ["swc", "plugin", "dynamic", "import"],
  "author": "Your Name",
  "license": "MIT"
}
```

```js title="index.js"
const path = require('path');

module.exports = function() {
  return {
    name: 'dynamic',
    setup(build) {
      // This is the entry point for the SWC plugin
      return path.join(__dirname, 'swc_plugin_dynamic.wasm');
    }
  };
};
```

##### Step 6: Publish and Install

```bash
# Publish to npm (or your private registry)
npm publish

# In your project, install the plugin
npm install @your-org/swc-plugin-dynamic
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
                    '@your-org/swc-plugin-dynamic',
                    {
                      isServer: false // false for client-side, true for server-side
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
                    path.join(__dirname, './swc-plugin-dynamic/swc_plugin_dynamic.wasm'),
                    {
                      isServer: false
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
cd swc-plugin-dynamic
cargo build --target wasm32-unknown-unknown --release

# 2. Copy the wasm file to your project
cp target/wasm32-unknown-unknown/release/swc_plugin_dynamic.wasm ../your-project/

# 3. Test the configuration
cd ../your-project
npm run build
```

##### Troubleshooting

1. **Plugin Version Compatibility**: Ensure your SWC plugin version matches the SWC version used by Rspack
2. **WASM Loading Issues**: Make sure the WASM file path is correct and accessible
3. **Build Errors**: Check that all Rust dependencies are properly configured
4. **Performance**: Monitor build times and optimize if needed
5. **Import Detection**: Verify that the `dynamic` function is properly imported from `@shuvi/runtime`

##### Testing Your Plugin

Create a test file to verify the transformation:

```ts title="test.ts"
import { dynamic } from '@shuvi/runtime';

// Client-side transformation
const ClientComponent = dynamic(() => import('./component'), {});

// Server-side transformation
const ServerComponent = dynamic(() => import('./component'), {});
```

Expected output after client-side transformation:
```ts
import { dynamic } from '@shuvi/runtime';

const ClientComponent = dynamic(() => import('./component'), {
  webpack: () => [require.resolveWeak('./component')]
});

const ServerComponent = dynamic(() => import('./component'), {
  webpack: () => [require.resolveWeak('./component')]
});
```

Expected output after server-side transformation:
```ts
import { dynamic } from '@shuvi/runtime';

const ClientComponent = dynamic(() => import('./component'), {
  modules: ['./component']
});

const ServerComponent = dynamic(() => import('./component'), {
  modules: ['./component']
});
```

### Migration Benefits

1. **Performance**: Rspack's `builtin:swc-loader` is implemented in Rust, providing better performance than JavaScript-based solutions
2. **Native Integration**: Direct integration with Rspack's build pipeline
3. **Flexibility**: Multiple approaches available depending on your specific needs
4. **Future-Proof**: Built on SWC's stable plugin architecture
5. **Type Safety**: Better TypeScript support with Rspack's built-in types

### Configuration Comparison

| Feature | @shuvi/compiler | Rspack Migration |
|---------|-----------------|------------------|
| Dynamic Import Detection | Automatic | Plugin-based or manual configuration |
| Client-side Transformation | `webpack: () => [require.resolveWeak('./component')]` | Same behavior via plugin |
| Server-side Transformation | `modules: ['./component']` | Same behavior via plugin |
| Error Handling | Built-in validation | Plugin-based validation |
| Performance | Good | Better (Rust implementation) |
| Import Pattern Support | Named imports from `@shuvi/runtime` | Same support via plugin |

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
                    '@your-org/swc-plugin-dynamic',
                    {
                      isServer: false
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

For more complex scenarios, you can combine multiple SWC plugins:

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
                    '@your-org/swc-plugin-dynamic',
                    {
                      isServer: false
                    }
                  ],
                  [
                    '@swc/plugin-remove-console',
                    {
                      exclude: ['error', 'warn']
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

### Environment-Specific Configuration

You can create different configurations for client and server builds:

```js title="rspack.config.client.mjs"
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
                    '@your-org/swc-plugin-dynamic',
                    {
                      isServer: false
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

```js title="rspack.config.server.mjs"
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
                    '@your-org/swc-plugin-dynamic',
                    {
                      isServer: true
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
