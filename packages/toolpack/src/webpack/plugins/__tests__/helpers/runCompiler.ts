import { createFsFromVolume, Volume } from 'memfs';
import type { Stats, Compiler } from 'webpack';

// https://github.com/streamich/memfs/issues/404#issuecomment-522450466
function ensureWebpackMemoryFs(fs: any) {
  // Return it back, when it has Webpack 'join' method
  if (fs.join) {
    return fs;
  }

  // Create FS proxy, adding `join` method to memfs, but not modifying original object
  const nextFs = Object.create(fs);
  const joinPath = require('memory-fs/lib/join');

  nextFs.join = joinPath;

  return nextFs;
}

export const runCompiler = (compiler: Compiler): Promise<Stats> => {
  const webpackFs = ensureWebpackMemoryFs(createFsFromVolume(new Volume()));

  compiler.outputFileSystem = webpackFs;

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      }

      if (stats.hasErrors()) {
        reject(new Error(stats.toJson().errors.join('\n')));
      }

      resolve(stats);
    });
  });
};

export const watchCompiler = (
  compiler: Compiler,
  cb: Compiler.Handler
): Promise<Compiler.Watching> => {
  const webpackFs = ensureWebpackMemoryFs(createFsFromVolume(new Volume()));

  compiler.outputFileSystem = webpackFs;

  return new Promise((resolve) => {
    const watcher = compiler.watch(
      {
        aggregateTimeout: 50,
        poll: undefined,
      },
      cb
    );
    setTimeout(() => resolve(watcher), 500);
  });
};
