import * as Rspack from '@shuvi/toolpack/lib/webpack';

export function getModuleById(
  id: string | undefined,
  compilation: Rspack.Compilation
) {
  /**
   * Find module by ID using ChunkGraph API.
   * Both Webpack and Rspack support this API pattern.
   */
  return [...compilation.modules].find(
    searchModule => compilation.chunkGraph.getModuleId(searchModule) === id
  );
}
