import path from 'path';

const PackageDir = path.resolve(__dirname, '..', '..');

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

export const resolveTypeFile = (...paths: string[]) =>
  path.join(PackageDir, '@types', 'shared', ...paths);

export const resolveRuntimeFile = (...paths: string[]) =>
  path.join(PackageDir, 'esm', 'shared', ...paths);

export const resolveRuntimeLibFile = (...paths: string[]) =>
  path.join(PackageDir, 'lib', 'shared', ...paths);
