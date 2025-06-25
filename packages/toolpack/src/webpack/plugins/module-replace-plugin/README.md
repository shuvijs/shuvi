# ModuleReplacePlugin

A powerful Webpack plugin for dynamically replacing modules during compilation based on resource query parameters.

## Overview

The `ModuleReplacePlugin` allows you to conditionally replace modules at build time, making it perfect for:
- Environment-specific module switching (dev/prod)
- Testing and mocking scenarios
- Hot module replacement optimizations
- Conditional feature toggles

## Features

- ✅ **Dynamic Module Replacement**: Replace modules based on resource queries
- ✅ **Multiple Matching Strategies**: Support for RegExp and function-based matching
- ✅ **Async Restoration**: Restore replaced modules with Promise-based API
- ✅ **Multi-Compiler Support**: Works with multiple Webpack compiler instances
- ✅ **Memory Safe**: Automatic cleanup of completed operations
- ✅ **TypeScript Support**: Full TypeScript definitions included

## Installation

This plugin is part of the Shuvi framework and is automatically available when using Shuvi's build system.

## Basic Usage

```javascript
const ModuleReplacePlugin = require('@shuvi/toolpack/webpack/plugins/module-replace-plugin');

module.exports = {
  // ... other webpack config
  plugins: [
    new ModuleReplacePlugin({
      modules: [
        {
          resourceQuery: /env=dev/,
          module: './dev-version.js'
        }
      ]
    })
  ]
};
```

## Configuration

### ModuleReplacePluginOptions

```typescript
interface ModuleReplacePluginOptions {
  modules: ConfigItem[];
}

type ConfigItem = {
  resourceQuery: Function | RegExp;
  module: string;
};
```

### ConfigItem Properties

| Property | Type | Description |
|----------|------|-------------|
| `resourceQuery` | `RegExp \| Function` | Matching condition for resource queries |
| `module` | `string` | Path to the replacement module |

## Matching Strategies

### 1. RegExp Matching

Use regular expressions for simple pattern matching:

```javascript
new ModuleReplacePlugin({
  modules: [
    {
      resourceQuery: /env=dev/,
      module: './dev-version.js'
    },
    {
      resourceQuery: /env=test/,
      module: './test-version.js'
    }
  ]
});
```

### 2. Function Matching

Use functions for complex matching logic:

```javascript
new ModuleReplacePlugin({
  modules: [
    {
      resourceQuery: (query) => {
        return query.includes('mock=true') && query.includes('api');
      },
      module: './mock-api.js'
    },
    {
      resourceQuery: (query) => {
        const params = new URLSearchParams(query);
        return params.get('feature') === 'new-ui';
      },
      module: './new-ui-components.js'
    }
  ]
});
```

## Advanced Examples

### Environment-Specific API Client

```javascript
// webpack.config.js
new ModuleReplacePlugin({
  modules: [
    {
      resourceQuery: /env=development/,
      module: './api-client-dev.js'
    },
    {
      resourceQuery: /env=staging/,
      module: './api-client-staging.js'
    },
    {
      resourceQuery: /env=production/,
      module: './api-client-prod.js'
    }
  ]
});

// Usage in code
import apiClient from './api-client.js?env=development';
```

### Feature Toggle System

```javascript
new ModuleReplacePlugin({
  modules: [
    {
      resourceQuery: /feature=new-ui/,
      module: './components/new-ui/index.js'
    },
    {
      resourceQuery: /feature=legacy/,
      module: './components/legacy/index.js'
    }
  ]
});

// Usage
import UI from './components/index.js?feature=new-ui';
```

### Testing and Mocking

```javascript
new ModuleReplacePlugin({
  modules: [
    {
      resourceQuery: /mock=true/,
      module: './mocks/database.js'
    },
    {
      resourceQuery: /mock=api/,
      module: './mocks/api-client.js'
    }
  ]
});

// In tests
import database from './database.js?mock=true';
import apiClient from './api-client.js?mock=api';
```

## Runtime API

The plugin provides static methods for dynamic module replacement at runtime.

### replaceModule(id: string)

Immediately mark a module for replacement:

```javascript
// Replace a module immediately
ModuleReplacePlugin.replaceModule('./api-client.js');

// The module will be replaced on the next compilation cycle
```

### restoreModule(id: string)

Restore a previously replaced module:

```javascript
// Restore a module and wait for completion
const result = ModuleReplacePlugin.restoreModule('./api-client.js');

if (result instanceof Promise) {
  await result;
  console.log('Module restored successfully');
} else {
  console.log('Module not found or not replaced');
}
```

## Integration Examples

### With React Hot Reload

```javascript
// webpack.config.js
new ModuleReplacePlugin({
  modules: [
    {
      resourceQuery: /hot=true/,
      module: './hot-reload-wrapper.js'
    }
  ]
});

// In your React components
import Component from './MyComponent.js?hot=true';
```

### With Testing Frameworks

```javascript
// jest.config.js
module.exports = {
  // ... other config
  setupFilesAfterEnv: ['<rootDir>/setup-tests.js']
};

// setup-tests.js
const ModuleReplacePlugin = require('@shuvi/toolpack/webpack/plugins/module-replace-plugin');

// Replace real modules with mocks for testing
ModuleReplacePlugin.replaceModule('./real-api.js');
```

### With Development Tools

```javascript
// webpack.config.js
const isDevelopment = process.env.NODE_ENV === 'development';

new ModuleReplacePlugin({
  modules: [
    {
      resourceQuery: /debug=true/,
      module: isDevelopment ? './debug-version.js' : './production-version.js'
    }
  ]
});
```

## How It Works

### 1. Module Collection Phase

During the `beforeCompile` phase, the plugin:
- Listens to module resolution events
- Analyzes resource queries against configured rules
- Stores matching modules for later processing

### 2. Module Building Phase

During the `buildModule` phase, the plugin:
- Checks if a module should be replaced or restored
- Modifies the pitch loader options accordingly
- Prevents duplicate processing with the `REPLACED` symbol

### 3. Pitch Loader Execution

The stub loader:
- Runs in the pitch phase before other loaders
- Generates new module source code
- Maintains proper exports from the replacement module

### 4. Cleanup Phase

After compilation:
- Cleans up completed restoration handlers
- Resolves pending promises
- Prevents memory leaks

## Performance Considerations

- **Caching**: The pitch loader disables caching (`cacheable(false)`) to ensure fresh replacements
- **Memory Management**: Automatic cleanup prevents memory leaks
- **Efficient Matching**: Early returns in matching functions for better performance

## Troubleshooting

### Module Not Being Replaced

1. Check that the resource query matches your configuration
2. Verify the replacement module path is correct
3. Ensure the plugin is applied before other plugins that might interfere

### Memory Leaks

The plugin automatically cleans up handlers, but if you're experiencing memory issues:
- Check that you're not creating infinite replacement loops
- Ensure proper cleanup in your application code

### TypeScript Issues

If using TypeScript, make sure to:
- Import the plugin with proper type annotations
- Use the exported interfaces for configuration

```typescript
import ModuleReplacePlugin, { ModuleReplacePluginOptions } from '@shuvi/toolpack/webpack/plugins/module-replace-plugin';

const options: ModuleReplacePluginOptions = {
  modules: [
    // your configuration
  ]
};
```

## Related

- [Webpack Loader API](https://webpack.js.org/api/loaders/)
- [Shuvi Framework](https://github.com/shuvi/shuvi)
- [Webpack Plugin Development](https://webpack.js.org/contribute/writing-a-plugin/) 