import { join, isAbsolute } from 'path';
import { NAME } from '@shuvi/shared/lib/constants';
import { IPaths } from '@shuvi/types';

interface IPathsOpts {
  rootDir: string;
  outputPath: string;
}

export function getPaths(opts: IPathsOpts): IPaths {
  const { rootDir, outputPath } = opts;
  const toAbsolute = (p: string) => join(rootDir, p);
  const srcDir = toAbsolute('src');
  const srcChildDir = (p: string) => join(srcDir, p);

  const buildDir =
    outputPath && isAbsolute(outputPath)
      ? outputPath
      : toAbsolute(outputPath || './build');

  return {
    rootDir,
    buildDir,
    srcDir,
    appDir: toAbsolute(`.${NAME}/app`),
    pagesDir: srcChildDir('pages'),
    publicDir: toAbsolute('public')
  };
}
