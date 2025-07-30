import {
  IModuleItem,
  IManifest,
  BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL
} from '../../../../../shared';
import { rspack, sources } from '@shuvi/toolpack/lib/webpack';
import * as Rspack from '@shuvi/toolpack/lib/webpack';

interface RspackPlugin {
  apply: (compiler: Rspack.Compiler) => void;
}

const { RawSource } = sources;

/**
 * Default configuration options for RspackBuildManifestPlugin
 */
const defaultOptions = {
  filename: 'build-manifest.json',
  modules: false,
  chunkRequest: false
};

/**
 * Configuration options for RspackBuildManifestPlugin
 */
interface Options {
  /** Output filename for the build manifest JSON file */
  filename: string;
  /** Whether to include module information in the manifest */
  modules: boolean;
  /** Whether to include chunk request information */
  chunkRequest: boolean;
}

/**
 * Extracts file extension from a filepath
 * @param filepath - The file path to extract extension from
 * @returns The file extension (without dot) or empty string if no extension
 *
 * @example
 * ```typescript
 * getFileExt('app.js') // returns 'js'
 * getFileExt('styles.css') // returns 'css'
 * getFileExt('README') // returns ''
 * ```
 */
function getFileExt(filepath: string): string {
  const match = filepath.match(/\.(\w+)$/);
  if (!match) return '';
  return match[1];
}

/**
 * Rspack plugin that generates a build manifest JSON file containing mappings
 * of entry filenames to their actual output filenames (which may be hashed in production).
 *
 * This plugin is adapted from the webpack version to work with Rspack's API.
 * It provides the same functionality for frameworks that need to know the relationship
 * between entry points and their corresponding built assets.
 *
 * ## Features
 * - Maps entry points to their output files
 * - Tracks bundle files and their relationships
 * - Collects polyfill files
 * - Supports loadable modules/chunks
 * - Handles both development and production builds
 *
 * ## Generated Manifest Structure
 * ```json
 * {
 *   "entries": {
 *     "main": {
 *       "js": ["/static/js/main.abc123.js"],
 *       "css": ["/static/css/main.def456.css"]
 *     }
 *   },
 *   "bundles": {
 *     "main": "/static/js/main.abc123.js"
 *   },
 *   "chunkRequest": {
 *     "/static/js/chunk.xyz789.js": "/pages/about"
 *   },
 *   "loadble": {
 *     "/pages/about": {
 *       "files": ["/static/js/chunk.xyz789.js"],
 *       "children": [
 *         {
 *           "id": "module-id",
 *           "name": "AboutPage"
 *         }
 *       ]
 *     }
 *   },
 *   "polyfillFiles": ["/static/js/polyfills.ghi012.js"]
 * }
 * ```
 *
 * ## Usage Example
 * ```typescript
 * // In rspack configuration
 * const RspackBuildManifestPlugin = require('./rspack-build-manifest-plugin');
 *
 * module.exports = {
 *   plugins: [
 *     new RspackBuildManifestPlugin({
 *       filename: 'build-manifest.json',
 *       modules: true,
 *       chunkRequest: true
 *     })
 *   ]
 * };
 * ```
 *
 * ## Use Cases
 * - **SSR Frameworks**: Map entry points to built assets for server-side rendering
 * - **Asset Loading**: Determine which files to load for specific routes
 * - **Cache Management**: Track hashed filenames for cache invalidation
 * - **Code Splitting**: Understand relationships between chunks and their requests
 *
 * ## Differences from Webpack Version
 * - Uses Rspack's API instead of Webpack's
 * - Simplified module collection (Rspack has different module APIs)
 * - Adapted to Rspack's chunk and compilation structure
 * - Some features are marked with TODO comments for future Rspack API support
 */
export default class RspackBuildManifestPlugin implements RspackPlugin {
  private _options: Options;
  private _manifest!: IManifest;

  /**
   * Creates a new RspackBuildManifestPlugin instance
   * @param options - Configuration options for the plugin
   *
   * @example
   * ```typescript
   * // Basic usage with default options
   * new RspackBuildManifestPlugin()
   *
   * // Custom configuration
   * new RspackBuildManifestPlugin({
   *   filename: 'assets-manifest.json',
   *   modules: true,
   *   chunkRequest: true
   * })
   * ```
   */
  constructor(options: Partial<Options> = {}) {
    this._options = {
      ...defaultOptions,
      ...options
    };
  }

  /**
   * Creates the build manifest by analyzing compilation assets and chunks
   * @param compiler - Rspack compiler instance
   * @param compilation - Rspack compilation instance
   * @returns The generated manifest object
   *
   * This method performs the following operations:
   * 1. Initializes the manifest structure
   * 2. Collects entry point information
   * 3. Processes chunk groups and their assets
   * 4. Identifies polyfill files
   * 5. Sorts and organizes loadable modules
   */
  createAssets(compiler: Rspack.Compiler, compilation: Rspack.Compilation) {
    const assetMap = (this._manifest = {
      entries: {},
      bundles: {},
      chunkRequest: {},
      loadble: {}
    });

    // TODO: Rspack 需要实现 chunk root modules 映射
    // Webpack 版本使用 chunkGraph.getChunkRootModules() 来创建映射
    // Rspack 可能需要使用不同的 API 或等待相关功能支持
    // const chunkRootModulesMap = new Map<ModuleId, Boolean>();
    // compilation.chunks.forEach(chunk => {
    //   const { chunkGraph } = compilation;
    //   if (chunkGraph) {
    //     chunkGraph.getChunkRootModules(chunk).forEach(module => {
    //       const id = chunkGraph.getModuleId(module);
    //       if (id !== '') {
    //         chunkRootModulesMap.set(id, true);
    //       }
    //     });
    //   }
    // });

    // Process all chunk groups
    compilation.chunkGroups.forEach(chunkGroup => {
      // Check if this is an entry point
      if (chunkGroup.isInitial()) {
        this._collectEntries(chunkGroup);
      }

      this._collect(chunkGroup, compiler, compilation);
    });

    const compilationAssets = compilation.getAssets();

    // Collect polyfill files
    this._manifest.polyfillFiles = compilationAssets
      .filter(p => {
        // Ensure only .js files are passed through
        if (!p.name.endsWith('.js')) {
          return false;
        }

        return p.info && BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL in p.info;
      })
      .map(v => v.name);

    // Sort loadable modules for consistent output
    this._manifest.loadble = Object.keys(this._manifest.loadble)
      .sort()
      // eslint-disable-next-line no-sequences
      .reduce((a, c) => ((a[c] = this._manifest.loadble[c]), a), {} as any);

    return assetMap;
  }

  /**
   * Applies the plugin to the rspack compiler
   * @param compiler - Rspack compiler instance
   *
   * This method hooks into the rspack compilation process to:
   * 1. Listen for the 'make' hook to prepare for asset processing
   * 2. Hook into 'processAssets' to generate the manifest file
   * 3. Create the JSON file as a compilation asset
   */
  apply(compiler: Rspack.Compiler) {
    compiler.hooks.make.tap('RspackBuildManifestPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'RspackBuildManifestPlugin',
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        assets => {
          assets[this._options.filename] = new RawSource(
            JSON.stringify(this.createAssets(compiler, compilation), null, 2),
            true
          );
        }
      );
    });
  }

  /**
   * Get the raw request of the chunk
   * @param compilation - Rspack compilation instance
   * @param chunk - Rspack chunk instance
   * @returns The raw request of the chunk
   */
  private _getFirstRawRequest(
    compilation: Rspack.Compilation,
    chunk: Rspack.Chunk
  ): string | undefined {
    const modules = compilation.chunkGraph.getChunkModules(chunk);
    const rawRequests = modules
      .map(m => {
        const rawRequest = (m as any).rawRequest;
        if (rawRequest) {
          return rawRequest;
        }
      })
      .filter(Boolean);
    if (rawRequests.length > 1) {
      /**
       * @rspack-diff
       * @TODO workaround: because Rspack's behavior is different from webpack
       * if rawRequests length > 1,
       * then try to return the sideEffectFree module's rawRequest
       */
      const sideEffectFreeModules = modules.filter(m => {
        const factoryMeta = (m as any).factoryMeta;
        return factoryMeta && factoryMeta.sideEffectFree === true;
      });
      if (sideEffectFreeModules.length) {
        const rawRequest: string | undefined = (sideEffectFreeModules[0] as any)
          .rawRequest;
        if (rawRequest) {
          return rawRequest;
        }
      }
    }

    return rawRequests[0] || '';
  }
  /**
   * Collects entry point information from chunk groups
   * @param entrypoint - The entry point chunk group to process
   *
   * This method processes entry points and maps them to their output files,
   * filtering out source maps and hot update files.
   */
  private _collectEntries(entrypoint: Rspack.ChunkGroup) {
    for (const chunk of entrypoint.chunks) {
      // If there's no name or no files
      if (!chunk.name || !chunk.files) {
        continue;
      }

      for (const file of chunk.files) {
        if (/\.map$/.test(file) || /\.hot-update\.js$/.test(file)) {
          continue;
        }

        const ext = getFileExt(file);
        this._pushEntries(entrypoint.name!, ext, file.replace(/\\/g, '/'));
      }
    }
  }

  /**
   * Collects information from chunk groups including chunks and modules
   * @param chunkGroup - The chunk group to process
   * @param compiler - Rspack compiler instance
   * @param compilation - Rspack compilation instance
   *
   * This method processes chunk groups to collect:
   * - Chunk information (files, requests)
   * - Module information (if enabled)
   * - Loadable modules and their relationships
   */
  private _collect(
    chunkGroup: Rspack.ChunkGroup,
    compiler: Rspack.Compiler,
    compilation: Rspack.Compilation
  ): void {
    const collectModules = this._options.modules;

    // Rspack chunk groups may have origins with request information
    const origins = chunkGroup.origins || [];
    origins.forEach(chunkGroupOrigin => {
      const { request } = chunkGroupOrigin;
      const ctx = { request: request || '', compiler, compilation };
      chunkGroup.chunks.forEach(chunk => {
        const rawRequest = this._getFirstRawRequest(compilation, chunk);
        if (rawRequest) {
          // @TODO lodable support
          // ctx.request = rawRequest;
        }
        this._collectChunk(chunk, ctx);
        if (collectModules) {
          this._collectChunkModule(chunk, ctx);
        }
      });
    });

    // If no origins, still process chunks
    if (origins.length === 0) {
      chunkGroup.chunks.forEach(chunk => {
        this._collectChunk(chunk, { request: '', compilation, compiler });
        if (collectModules) {
          this._collectChunkModule(chunk, {
            request: '',
            compiler,
            compilation
          });
        }
      });
    }
  }

  /**
   * Collects information from individual chunks
   * @param chunk - The rspack chunk to process
   * @param request - The request that generated this chunk
   *
   * This method processes chunks to:
   * - Identify bundle files
   * - Map chunk requests to files
   * - Filter out source maps and hot update files
   */
  private _collectChunk(
    chunk: Rspack.Chunk,
    {
      request,
      compilation,
      compiler
    }: {
      request: string;
      compilation: Rspack.Compilation;
      compiler: Rspack.Compiler;
    }
  ) {
    if (!chunk.files) {
      return;
    }
    for (const file of chunk.files) {
      if (/\.map$/.test(file) || /\.hot-update\.js$/.test(file)) {
        continue;
      }

      const ext = getFileExt(file);
      const normalizedPath = file.replace(/\\/g, '/');

      // normal chunk
      if (ext === 'js') {
        if (chunk.isOnlyInitial()) {
          this._pushBundle({
            name: chunk.name,
            file: normalizedPath
          });
        }

        this._pushChunkRequest({
          file: normalizedPath,
          request: request
        });
      }
    }
  }

  /**
   * Collects module information from chunks (when modules option is enabled)
   * @param chunk - The rspack chunk to process
   * @param request - The request that generated this chunk
   * @param compiler - Rspack compiler instance
   * @param compilation - Rspack compilation instance
   *
   * This method processes chunks to collect:
   * - Loadable module files (JS and CSS)
   * - Module metadata (ID, name) - simplified for Rspack
   * - Root modules for code splitting analysis
   */
  private _collectChunkModule(
    chunk: Rspack.Chunk,
    {
      request,
      compiler,
      compilation
    }: {
      request: string;
      compiler: Rspack.Compiler;
      compilation: Rspack.Compilation;
    }
  ) {
    if (chunk.canBeInitial()) {
      return;
    }

    const context = compiler.options.context!;

    // Collect files from chunk
    chunk.files.forEach((file: string) => {
      const isJs = file.match(/\.js$/) && file.match(/^static\/chunks\//);
      const isCss = file.match(/\.css$/) && file.match(/^static\/css\//);
      if (isJs || isCss) {
        this._pushLoadableModules(request, file);
      }
    });

    // TODO: Rspack 模块收集需要适配
    // Webpack 版本使用 chunkGraph.getChunkModulesIterable() 和 chunkRootModulesMap
    // Rspack 可能需要使用不同的 API 或等待相关功能支持
    // 当前实现是简化版本，可能需要根据 Rspack 的实际 API 进行调整
    try {
      const { chunkGraph } = compilation;
      if (
        chunkGraph &&
        typeof chunkGraph.getChunkModulesIterable === 'function'
      ) {
        for (const module of chunkGraph.getChunkModulesIterable(chunk)) {
          let id = chunkGraph.getModuleId(module);
          if (!module.type || !module.type.startsWith('javascript')) {
            continue;
          }

          let name = null;
          if (typeof module.libIdent === 'function') {
            name = module.libIdent({ context });
          }

          if (!name || name.endsWith('.css')) {
            continue;
          }

          // TODO: Rspack 需要实现 chunk root modules 检查
          // Webpack 版本使用 chunkRootModulesMap.has(id) 来检查是否为根模块
          // Rspack 可能需要使用不同的方式来判断模块是否为根模块
          // 当前暂时将所有模块都作为 loadable 模块处理
          // const isRootModule = chunkRootModulesMap.has(id);
          // if (isRootModule) {
          this._pushLoadableModules(request, {
            id,
            name
          } as IModuleItem);
          // }
        }
      }
    } catch (error) {
      // Rspack might not have the same module APIs as webpack
      // This is a fallback for compatibility
      console.warn(
        'RspackBuildManifestPlugin: Module collection not fully supported in this Rspack version'
      );
    }
  }

  /**
   * Adds entry information to the manifest
   * @param name - Entry point name
   * @param ext - File extension
   * @param value - File path
   *
   * @example
   * ```typescript
   * this._pushEntries('main', 'js', '/static/js/main.abc123.js')
   * // Results in: { entries: { main: { js: ['/static/js/main.abc123.js'] } } }
   * ```
   */
  private _pushEntries(name: string, ext: string, value: string) {
    const entries = this._manifest.entries;
    if (!entries[name]) {
      entries[name] = {
        js: []
      };
    }
    if (!entries[name][ext]) {
      entries[name][ext] = [value];
    } else {
      entries[name][ext].push(value);
    }
  }

  /**
   * Adds bundle information to the manifest
   * @param name - Bundle name
   * @param file - Bundle file path
   *
   * @example
   * ```typescript
   * this._pushBundle({ name: 'main', file: '/static/js/main.abc123.js' })
   * // Results in: { bundles: { main: '/static/js/main.abc123.js' } }
   * ```
   */
  private _pushBundle({
    name,
    file
  }: {
    name: string | undefined;
    file: string;
  }) {
    if (name) {
      this._manifest.bundles[name] = file;
    }
  }

  /**
   * Adds chunk request information to the manifest (when chunkRequest option is enabled)
   * @param file - Chunk file path
   * @param request - Request that generated the chunk
   *
   * @example
   * ```typescript
   * this._pushChunkRequest({
   *   file: '/static/js/chunk.xyz789.js',
   *   request: '/pages/about'
   * })
   * // Results in: { chunkRequest: { '/static/js/chunk.xyz789.js': '/pages/about' } }
   * ```
   */
  private _pushChunkRequest({
    file,
    request
  }: {
    file: string;
    request: string;
  }) {
    if (this._options.chunkRequest && request) {
      this._manifest.chunkRequest[file] = request;
    }
  }

  /**
   * Adds loadable module information to the manifest
   * @param request - The request that generated the loadable module
   * @param module - Module item with ID and name
   *
   * @example
   * ```typescript
   * // Adding a file
   * this._pushLoadableModules('/pages/about', '/static/js/chunk.xyz789.js')
   *
   * // Adding a module
   * this._pushLoadableModules('/pages/about', {
   *   id: 'module-id',
   *   name: 'AboutPage'
   * })
   * ```
   */
  private _pushLoadableModules(request: string, module: IModuleItem): void;
  private _pushLoadableModules(request: string, file: string): void;
  private _pushLoadableModules(request: string, value: string | IModuleItem) {
    const modules = this._manifest.loadble;
    if (!modules[request]) {
      modules[request] = {
        files: [],
        children: []
      };
    }

    if (typeof value === 'string') {
      const existed = modules[request]!.files.some(file => file === value);
      if (!existed) {
        modules[request]!.files.push(value);
      }
    } else {
      const existed = modules[request]!.children.some(
        item => item.id === value.id
      );
      if (!existed) {
        modules[request]!.children.push(value);
      }
    }
  }
}
