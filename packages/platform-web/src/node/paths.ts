import * as path from 'path';
import { isWindowsSystem, pathToFileUrl } from '@shuvi/utils/lib/platform';

const PACKAGE_DIR = path.resolve(__dirname, '..', '..');

export const resolveDep = (module: string) => require.resolve(module);

export const resolveLib = (module: string) =>
  path.dirname(resolveDep(path.join(module, 'package.json')));

export const resolvePkgFile = (...paths: string[]) => {
  const targetPath = path.join(PACKAGE_DIR, ...paths);
  if (isWindowsSystem()) {
    return pathToFileUrl(targetPath);
  }
  return targetPath;
};
