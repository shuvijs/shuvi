import { resolve, dirname, join } from 'path';

export const PACKAGE_DIR = resolve(__dirname, '..', '..', 'esm');

export const resolveToModulePath = (...paths: string[]) =>
  `@shuvi/platform-web/${paths.join('/')}`;

export const resolveDep = (module: string) => require.resolve(module);

export const resolveLib = (module: string) =>
  dirname(resolveDep(join(module, 'package.json')));
