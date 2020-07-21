import { resolve, dirname } from 'path';

export const PACKAGE_DIR = dirname(
  require.resolve('@shuvi/runtime-react/package.json')
);

export const resolveAppFile = (...paths: string[]) =>
  `${resolve(PACKAGE_DIR, 'shuvi-app', ...paths)}`;

export const resolveDep = (module: string) => require.resolve(module);
