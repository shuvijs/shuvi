import type webpack from '@shuvi/toolpack/webpack';

export function getModuleById(
  id: string | undefined,
  compilation: webpack.Compilation
) {
  return [...compilation.modules].find(
    searchModule => compilation.chunkGraph.getModuleId(searchModule) === id
  );
}
