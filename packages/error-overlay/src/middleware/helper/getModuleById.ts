import * as Rspack from '@shuvi/toolpack/lib/webpack';

export function getModuleById(
  id: string | undefined,
  compilation: Rspack.Compilation
) {
  /**
   * @unsupported Rspack does not support ChunkGraph API in the same way as Webpack.
   * TODO: Use Rspack's equivalent API when available or implement alternative module lookup.
   */
  // return [...compilation.modules].find(
  //   searchModule => compilation.chunkGraph.getModuleId(searchModule) === id
  // );

  // Fallback implementation for Rspack
  return [...compilation.modules].find(
    searchModule => compilation.chunkGraph.getModuleId(searchModule) === id
  );
}
