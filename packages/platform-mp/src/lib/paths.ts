import { resolve, dirname, join } from 'path';
import { PACKAGE_ROUTER } from './constants';

export const resolveDep = (module: string) => require.resolve(module);

export const resolveLib = (module: string) =>
  dirname(resolveDep(join(module, 'package.json')));

export const PACKAGE_RESOLVED = resolve(__dirname, '..');

export const resolveAppFile = (...paths: string[]) =>
  `${resolve(PACKAGE_RESOLVED, 'shuvi-app', ...paths)}`;

export const resolveRouterFile = (...paths: string[]) =>
  `${resolve(resolveLib(PACKAGE_ROUTER), ...paths)}`;
