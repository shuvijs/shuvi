import { IContext, MultiStats } from '../types';

export default function getPaths(context: IContext) {
  const { stats, options } = context;

  //client and server
  const childStats = (stats as MultiStats).stats;
  const publicPaths = [];

  for (const { compilation } of childStats) {
    // The `output.path` is always present and always absolute
    const outputPath = compilation.getPath(compilation.outputOptions.path!);
    const publicPath = compilation.getPath(options.publicPath);

    publicPaths.push({ outputPath, publicPath });
  }

  return publicPaths;
}
