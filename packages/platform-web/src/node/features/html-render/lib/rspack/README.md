# RspackBuildManifestPlugin

A Rspack plugin that generates a build manifest JSON file containing mappings of entry filenames to their actual output filenames. This plugin is adapted from the webpack version to work with Rspack's API.

## 🚀 Features

- **Asset Mapping**: Maps entry points to their output files (including hashed filenames)
- **Code Splitting Support**: Tracks dynamic chunks and their relationships
- **Polyfill Detection**: Identifies and tracks polyfill files
- **Module Information**: Collects module metadata for debugging
- **Request Tracking**: Maps chunk requests to their corresponding files
- **SSR Ready**: Perfect for server-side rendering frameworks

## 📦 Installation

```bash
# If using npm
npm install @shuvi/platform-web

# If using yarn
yarn add @shuvi/platform-web

# If using pnpm
pnpm add @shuvi/platform-web
```

## 🔧 Basic Usage

```javascript
const RspackBuildManifestPlugin = require('@shuvi/platform-web/lib/rspack/build-manifest-plugin');

module.exports = {
  plugins: [
    new RspackBuildManifestPlugin()
  ]
};
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filename` | `string` | `'build-manifest.json'` | Output filename for the manifest |
| `modules` | `boolean` | `false` | Include module information in manifest |
| `chunkRequest` | `boolean` | `false` | Include chunk request information |

### Configuration Examples

```javascript
// Basic configuration
new RspackBuildManifestPlugin({
  filename: 'build-manifest.json'
})

// Full configuration for SSR frameworks
new RspackBuildManifestPlugin({
  filename: 'build-manifest.json',
  modules: true,
  chunkRequest: true
})

// Custom filename for framework integration
new RspackBuildManifestPlugin({
  filename: '_next/static/build-manifest.json',
  modules: true,
  chunkRequest: true
})
```

## 📄 Generated Manifest Structure

The plugin generates a JSON file with the following structure:

```json
{
  "entries": {
    "main": {
      "js": ["/static/js/main.abc123.js"],
      "css": ["/static/css/main.def456.css"]
    }
  },
  "bundles": {
    "main": "/static/js/main.abc123.js"
  },
  "chunkRequest": {
    "/static/js/chunk.xyz789.js": "/pages/about"
  },
  "loadble": {
    "/pages/about": {
      "files": ["/static/js/chunk.xyz789.js"],
      "children": [
        {
          "id": "module-id",
          "name": "AboutPage"
        }
      ]
    }
  },
  "polyfillFiles": ["/static/js/polyfills.ghi012.js"]
}
```

### Manifest Fields Explained

- **`entries`**: Maps entry point names to their output files by type
- **`bundles`**: Direct mapping of bundle names to their main file
- **`chunkRequest`**: Maps chunk files to the requests that generated them
- **`loadble`**: Information about loadable modules and their dependencies
- **`polyfillFiles`**: List of polyfill files that need to be loaded

## 🎯 Use Cases

### 1. Server-Side Rendering (SSR)

```javascript
// Server-side code to load assets
const manifest = require('./dist/build-manifest.json');

function getAssetsForEntry(entryName) {
  const entry = manifest.entries[entryName];
  return {
    js: entry.js || [],
    css: entry.css || []
  };
}

// Usage in SSR
const assets = getAssetsForEntry('main');
// Returns: { js: ['/static/js/main.abc123.js'], css: ['/static/css/main.def456.css'] }
```

### 2. Dynamic Asset Loading

```javascript
// Client-side code for dynamic imports
const manifest = require('./build-manifest.json');

function loadAssetsForRoute(route) {
  const loadable = manifest.loadble[route];
  if (loadable) {
    return loadable.files.map(file => {
      const script = document.createElement('script');
      script.src = file;
      document.head.appendChild(script);
      return script;
    });
  }
  return [];
}
```

### 3. Cache Management

```javascript
// Cache busting with hashed filenames
const manifest = require('./build-manifest.json');

function getAssetUrl(entryName, type = 'js') {
  const entry = manifest.entries[entryName];
  return entry && entry[type] ? entry[type][0] : null;
}

// Always get the latest version
const mainJsUrl = getAssetUrl('main', 'js');
// Returns: '/static/js/main.abc123.js' (with current hash)
```

## 🔄 Differences from Webpack Version

| Feature | Webpack Version | Rspack Version |
|---------|----------------|----------------|
| **API Compatibility** | Uses webpack APIs | Uses rspack APIs |
| **Module Collection** | Full module graph support | Simplified module collection |
| **Performance** | Standard webpack performance | Optimized for Rspack's Rust backend |
| **Plugin System** | Webpack plugin hooks | Rspack plugin hooks |
| **Chunk Graph** | Full chunk graph access | Limited chunk graph access |

### Key Adaptations

1. **Import Changes**: Uses `@shuvi/toolpack/lib/rspack` instead of webpack
2. **API Compatibility**: Adapted to Rspack's chunk and compilation APIs
3. **Module Collection**: Simplified due to Rspack's different module system
4. **Error Handling**: Added fallbacks for Rspack-specific API differences

## 🛠️ Integration Examples

### With React/TypeScript

```javascript
// rspack.config.js
const RspackBuildManifestPlugin = require('@shuvi/platform-web/lib/rspack/build-manifest-plugin');

module.exports = {
  entry: {
    main: './src/main.tsx'
  },
  output: {
    path: './dist',
    filename: 'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js'
  },
  plugins: [
    new RspackBuildManifestPlugin({
      filename: 'build-manifest.json',
      modules: true,
      chunkRequest: true
    })
  ]
};
```

### With Next.js-like Framework

```javascript
// For frameworks that expect Next.js-style manifests
new RspackBuildManifestPlugin({
  filename: '_next/static/build-manifest.json',
  modules: true,
  chunkRequest: true
})
```

### With Custom Asset Loading

```javascript
// Custom asset loader using the manifest
class AssetLoader {
  constructor(manifest) {
    this.manifest = manifest;
  }

  loadEntry(entryName) {
    const entry = this.manifest.entries[entryName];
    if (!entry) return Promise.resolve();

    const promises = [];
    
    // Load CSS files
    if (entry.css) {
      entry.css.forEach(cssFile => {
        promises.push(this.loadCSS(cssFile));
      });
    }

    // Load JS files
    if (entry.js) {
      entry.js.forEach(jsFile => {
        promises.push(this.loadJS(jsFile));
      });
    }

    return Promise.all(promises);
  }

  loadCSS(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  loadJS(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Module Collection Not Working**
   ```javascript
   // Rspack has different module APIs, so module collection might be limited
   // Use the modules: false option if you encounter issues
   new RspackBuildManifestPlugin({
     modules: false
   })
   ```

2. **Chunk Request Information Missing**
   ```javascript
   // Make sure chunkRequest is enabled
   new RspackBuildManifestPlugin({
     chunkRequest: true
   })
   ```

3. **Polyfill Files Not Detected**
   ```javascript
   // Ensure polyfill files are marked with the correct symbol
   // The plugin looks for BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL in asset info
   ```

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=rspack-build-manifest-plugin npm run build
```

## 📚 API Reference

### Constructor

```typescript
new RspackBuildManifestPlugin(options?: Partial<Options>)
```

### Options Interface

```typescript
interface Options {
  filename: string;      // Output filename
  modules: boolean;      // Include module information
  chunkRequest: boolean; // Include chunk request information
}
```

### Methods

- `apply(compiler: Compiler)`: Applies the plugin to the Rspack compiler
- `createAssets(compiler: Compiler, compilation: Compilation)`: Creates the manifest

## 🤝 Contributing

When contributing to the Rspack version:

1. Test with different Rspack versions
2. Ensure compatibility with Rspack's evolving API
3. Add fallbacks for missing APIs
4. Update documentation for Rspack-specific features

## 📄 License

This plugin is part of the Shuvi framework and follows the same license terms. 