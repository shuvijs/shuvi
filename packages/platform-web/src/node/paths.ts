import * as path from 'path';

const PACKAGE_DIR = path.resolve(__dirname, '..', '..');

// export const resolveToModulePath = (...paths: string[]) =>
//   `@shuvi/platform-web/${paths.join('/')}`;

export const resolveDep = (module: string) => require.resolve(module);

export const resolveLib = (module: string) =>
  path.dirname(resolveDep(path.join(module, 'package.json')));

export const resolvePkgFile = (...paths: string[]) =>
  path.join(PACKAGE_DIR, ...paths);
