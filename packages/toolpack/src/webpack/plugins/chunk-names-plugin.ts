import { Compiler, HotUpdateChunk } from 'webpack';

// This plugin mirrors webpack 3 `filename` and `chunkfilename` behavior
// This fixes https://github.com/webpack/webpack/issues/6598
// This plugin is based on https://github.com/researchgate/webpack/commit/2f28947fa0c63ccbb18f39c0098bd791a2c37090
export default class ChunkNamesPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('ChunkNamesPlugin', compilation => {
      compilation.hooks.renderManifest.intercept({
        register(tapInfo: any) {
          if (tapInfo.name === 'JavascriptModulesPlugin') {
            const originalMethod = tapInfo.fn;
            tapInfo.fn = (result: any, options: any) => {
              let filenameTemplate;
              const chunk = options.chunk;
              const outputOptions = options.outputOptions;

              // Note: fix Conflict: Multiple assets emit different content to the same filename static/chunks/page-xxxx.js
              if (chunk instanceof HotUpdateChunk) {
                return originalMethod(result, options);
              }
            
              const chunkGraph = options.chunkGraph;
              const hasEntryModule =
                chunkGraph.getNumberOfEntryModules(chunk) > 0;

              if (chunk.filenameTemplate) {
                filenameTemplate = chunk.filenameTemplate;
              } else if (chunk.hasRuntime() || hasEntryModule) {
                filenameTemplate = outputOptions.filename;
              } else {
                filenameTemplate = outputOptions.chunkFilename;
              }

              options.chunk.filenameTemplate = filenameTemplate;
              return originalMethod(result, options);
            };
          }
          return tapInfo;
        }
      });
    });
  }
}
