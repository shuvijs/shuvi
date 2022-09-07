import * as path from 'path';
import { isWindowsSystem, pathToFileUrl } from '@shuvi/utils/lib/platform';

const PACKAGE_DIR = path.resolve(__dirname, '..', '..');

export const resolveDep = (module: string) => require.resolve(module);

export const resolveLib = (module: string) =>
  path.dirname(resolveDep(path.join(module, 'package.json')));

export const resolvePkgFileWithoutFileProtocol = (...paths: string[]) =>
  isWindowsSystem()
    ? path.win32.join(PACKAGE_DIR, ...paths)
    : path.join(PACKAGE_DIR, ...paths);

export const resolvePkgFile = (...paths: string[]) => {
  if (isWindowsSystem()) {
    return pathToFileUrl(path.win32.join(PACKAGE_DIR, ...paths));
  }
  return path.join(PACKAGE_DIR, ...paths);
};
