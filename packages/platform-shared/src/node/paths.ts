import path from 'path';
import { isWindowsSystem, pathToFileUrl } from '@shuvi/utils/lib/platform';

export const PackageDir = path.resolve(__dirname, '..', '..');

export const resolvePluginFile = (pluginName: string, ...paths: string[]) =>
  path.join(
    PackageDir,
    'lib',
    'node',
    'platform',
    'plugins',
    pluginName,
    ...paths
  );

export const resolvePkgFileWithoutFileProtocol = (...paths: string[]) =>
  isWindowsSystem()
    ? path.win32.join(PackageDir, ...paths)
    : path.join(PackageDir, ...paths);

export const resolvePkgFile = (...paths: string[]) => {
  if (isWindowsSystem()) {
    return pathToFileUrl(path.win32.join(PackageDir, ...paths));
  }
  return path.join(PackageDir, ...paths);
};
