import path from 'path';

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

export const resolvePkgFile = (...paths: string[]) =>
  path.join(PackageDir, ...paths);
