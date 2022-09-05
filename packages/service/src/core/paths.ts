import { join, isAbsolute } from 'path';
import { NAME } from '@shuvi/shared/lib/constants';
import { IPaths } from './apiTypes';
import * as os from 'os';
import * as url from 'url';

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

  const paths = {
    rootDir,
    srcDir,
    routesDir: srcChildDir('routes'),
    privateDir: toAbsolute(`.${NAME}`),
    appDir: toAbsolute(`.${NAME}/app`),
    resources: toAbsolute(`.${NAME}/app/resources.js`),
    runtimeDir: toAbsolute(`.${NAME}/app/runtime`),
    cacheDir: toAbsolute(`.${NAME}/cache`),
    buildDir: toAbsolute(outputPath),
    publicDir: toAbsolute(publicDir)
  };
  if (os.platform() === 'win32') {
    Object.keys(paths).forEach(key => {
      paths[key as keyof IPaths] = url
        .pathToFileURL(paths[key as keyof IPaths])
        .toString();
    });
  }
  return paths;
}
