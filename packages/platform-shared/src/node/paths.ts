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

export const resolvePkgFile = (...paths: string[]) => {
  const targetPath = path.join(PackageDir, ...paths);
  if (isWindowsSystem()) {
    return pathToFileUrl(targetPath);
  }
  return targetPath;
};
