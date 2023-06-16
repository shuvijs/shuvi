import * as path from 'path';

const PACKAGE_DIR = path.resolve(__dirname, '..', '..');

export const resolveDep = (module: string) => require.resolve(module);

export const resolveLib = (module: string) =>
  path.dirname(resolveDep(path.join(module, 'package.json')));

export const resolvePkgFile = (...paths: string[]) =>
  path.join(PACKAGE_DIR, ...paths);

export const resolveLocal = (m: string, sub?: string) => {
  const pck = resolveLib(m);
  return sub ? `${pck}/${sub}` : pck;
};
