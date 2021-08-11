import { resolve, dirname, join } from 'path';

export const PACKAGE_DIR = dirname(
  require.resolve('@shuvi/platform-taro/package.json')
);

export const resolveAppFile = (...paths: string[]) =>
  `${resolve(PACKAGE_DIR, 'shuvi-app', ...paths)}`;

export const resolveDep = (module: string) => require.resolve(module);

export const resolveLib = (module: string) =>
  dirname(resolveDep(join(module, 'package.json')));
