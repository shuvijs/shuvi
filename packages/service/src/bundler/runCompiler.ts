import { Compiler, Stats, MultiCompiler } from 'webpack';

import type webpack from 'webpack';

export type BundlerResult = {
  errors: webpack.StatsError[];
  warnings: webpack.StatsError[];
};

function generateStats(result: BundlerResult, stat: Stats): BundlerResult {
  const { errors, warnings } = stat.toJson({
    all: false,
    warnings: true,
    errors: true
  });
  if (errors && errors.length > 0) {
    result.errors.push(...errors);
  }

  if (warnings && warnings.length > 0) {
    result.warnings.push(...warnings);
  }

  return result;
}

export function runCompiler(
  compiler: Compiler | MultiCompiler
): Promise<BundlerResult> {
  return new Promise(async (resolve, reject) => {
    compiler.run((err: Error | undefined, statsOrMultiStats: any) => {
      compiler.close(() => {
        if (err) {
          return reject(err);
        }

        if (statsOrMultiStats.stats) {
          const result: BundlerResult = statsOrMultiStats.stats.reduce(
            generateStats,
            { errors: [], warnings: [] }
          );
          return resolve(result);
        }

        const result = generateStats(
          { errors: [], warnings: [] },
          statsOrMultiStats
        );
        return resolve(result);
      });
    });
  });
}
