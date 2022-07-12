import path from 'path';

const PackageDir = path.resolve(__dirname, '..', '..');

export const resolveToModulePath = (...paths: string[]) =>
  `@shuvi/platform-shared/${paths.join('/')}`;

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

// export const resolveRuntimeLibFile = (...paths: string[]) =>
//   path.join(PackageDir, 'lib', 'shared', ...paths);
