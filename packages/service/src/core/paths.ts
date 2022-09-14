import { join, isAbsolute } from 'path';
import { NAME } from '@shuvi/shared/lib/constants';
import { PUBLIC_DIR_NAME } from '../constants';
import { IPaths } from './apiTypes';

interface IPathsOpts {
  rootDir: string;
  outputPath: string;
}

export function getPaths(opts: IPathsOpts): IPaths {
  const { rootDir, outputPath } = opts;
  const resolvePath = (...p: string[]) => {
    const fullpath = join(...p);
    return isAbsolute(fullpath) ? fullpath : join(rootDir, fullpath);
  };

  return {
    rootDir,
    srcDir: resolvePath('src'),
    routesDir: resolvePath('src', 'routes'),
    privateDir: resolvePath(`.${NAME}`),
    appDir: resolvePath(`.${NAME}`, 'app'),
    runtimeDir: resolvePath(`.${NAME}`, 'app', 'runtime'),
    cacheDir: resolvePath(`.${NAME}`, 'cache'),
    buildDir: resolvePath(outputPath),
    publicDir: resolvePath(PUBLIC_DIR_NAME),
    resourcesFile: resolvePath(`.${NAME}`, 'app', 'resources.js')
  };
}
