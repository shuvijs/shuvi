import type webpack from '@shuvi/toolpack/lib/webpack';

export function getModuleById(
  id: string | undefined,
  compilation: webpack.Compilation
) {
  return [...compilation.modules].find(
    searchModule => compilation.chunkGraph.getModuleId(searchModule) === id
  );
}
