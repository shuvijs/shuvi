import { PitchLoaderDefinitionFunction, LoaderContext } from 'webpack';
import dynamicLoaderOptionsHack from './dynamic-loader-options-hack';

/**
 * Options passed to the stub loader from the ModuleReplacePlugin
 */
export interface ModuleReplaceOption {
  /** Path of the module to replace the original with */
  replacedModule: string;
}

/**
 * Filter function to remove the stub loader itself from the loader chain
 * This prevents infinite recursion when the loader processes itself
 *
 * @param l - Loader object to check
 * @returns True if the loader is not the stub loader itself
 */
const isSelfLoader = (l: any) => l.path !== __filename;

/**
 * Generate a webpack request string from an array of loaders
 * This creates the proper format for webpack's loader resolution
 *
 * @param loaderCtx - Webpack loader context
 * @param loaders - Array of loader configurations
 * @returns Formatted request string for webpack
 */
const genRequest = (loaderCtx: LoaderContext<any>, loaders: any[]) => {
  const loaderStrings: string[] = [];

  loaders.forEach(loader => {
    const request = typeof loader === 'string' ? loader : loader.request;
    // loader.request contains both the resolved loader path and its options
    // query (e.g. ??ref-0)
    loaderStrings.push(request);
  });

  return JSON.stringify(
    loaderCtx.utils.contextify(
      loaderCtx.context || loaderCtx.rootContext,
      '-!' +
        [
          ...loaderStrings,
          loaderCtx.resourcePath + loaderCtx.resourceQuery
        ].join('!')
    )
  );
};

/**
 * Pitch loader function for module replacement
 *
 * This loader runs in the "pitch" phase of webpack's loader pipeline,
 * which means it executes before the actual module content is processed.
 * It's responsible for:
 * - Intercepting module requests
 * - Replacing the module source with a different module
 * - Maintaining proper exports from the replacement module
 *
 * The pitch function returns a string that becomes the new module source,
 * effectively replacing the original module content.
 *
 * @example
 * ```javascript
 * // When replacing './api.js' with './mock-api.js'
 * // This loader will generate:
 * // import mod from './mock-api.js';
 * // export * from './mock-api.js';
 * // export default mod;
 * ```
 */
export const pitch: PitchLoaderDefinitionFunction<ModuleReplaceOption> =
  function (this) {
    // Disable caching to ensure fresh module replacement
    this.cacheable(false);

    const dynamicOptions = dynamicLoaderOptionsHack.pop(this.resourcePath);

    // Get the replacement module path from loader options
    /**
     * rspack can't get the dynamic options from the loader, so we need to use the dynamicLoaderOptionsHack to get the options
     */
    // const { replacedModule } = this.getOptions() || {};
    const { replacedModule } = dynamicOptions || {};
    let loaders = this.loaders;

    // Remove the stub loader itself from the loader chain
    // This prevents the loader from processing its own output
    loaders = loaders.filter(isSelfLoader);

    // Determine the request path based on whether we're replacing or using original
    const request = replacedModule
      ? JSON.stringify(
          this.utils.contextify(
            this.context || this.rootContext,
            replacedModule
          )
        )
      : genRequest(this, loaders);

    // Generate the new module source
    // This creates a module that:
    // 1. Imports the replacement module as default export
    // 2. Re-exports all named exports from the replacement module
    // 3. Provides the default export from the replacement module
    return `
import mod from ${request}; 
export * from ${request}
export default mod;
`.trim();
  };
