import { join, isAbsolute } from 'path';
import { NAME } from '@shuvi/shared/lib/constants';
import { IPaths } from './apiTypes';

interface IPathsOpts {
  rootDir: string;
  outputPath: string;
  publicDir: string;
}

export function getPaths(opts: IPathsOpts): IPaths {
  const { rootDir, outputPath, publicDir } = opts;
  const toAbsolute = (p: string) => (isAbsolute(p) ? p : join(rootDir, p));
  const srcDir = toAbsolute('src');
  const srcChildDir = (p: string) => join(srcDir, p);

  return {
    rootDir,
    srcDir,
    routesDir: srcChildDir('routes'),
    privateDir: toAbsolute(`.${NAME}`),
    appDir: toAbsolute(`.${NAME}/app`),
    runtimeDir: toAbsolute(`.${NAME}/runtime`),
    resources: toAbsolute(`.${NAME}/resources/index.js`),
    cacheDir: toAbsolute(`.${NAME}/cache`),
    buildDir: toAbsolute(outputPath),
    publicDir: toAbsolute(publicDir)
  };
}
