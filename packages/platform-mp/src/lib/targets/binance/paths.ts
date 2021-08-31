import { resolve, dirname, join } from 'path';
import { PACKAGE_NAME } from './constants';

export const resolveDep = (module: string) => require.resolve(module);

export const resolveLib = (module: string) =>
  dirname(resolveDep(join(module, 'package.json')));

export const PACKAGE_RESOLVED = resolveLib(PACKAGE_NAME);

export const resolveAppFile = (...paths: string[]) =>
  `${resolve(PACKAGE_RESOLVED, 'shuvi-app', ...paths)}`;
