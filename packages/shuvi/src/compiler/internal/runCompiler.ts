import { Compiler, Stats, MultiCompiler } from "webpack";

export type CompilerResult = {
  errors: string[];
  warnings: string[];
};

function generateStats(result: CompilerResult, stat: Stats): CompilerResult {
  const { errors, warnings } = stat.toJson({
    all: false,
    warnings: true,
    errors: true
  });
  if (errors.length > 0) {
    result.errors.push(...errors);
  }

  if (warnings.length > 0) {
    result.warnings.push(...warnings);
  }

  return result;
}

export function runCompiler(
  compiler: Compiler | MultiCompiler
): Promise<CompilerResult> {
  return new Promise(async (resolve, reject) => {
    compiler.run((err: Error, statsOrMultiStats: any) => {
      if (err) {
        return reject(err);
      }

      if (statsOrMultiStats.stats) {
        const result: CompilerResult = statsOrMultiStats.stats.reduce(
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
}
