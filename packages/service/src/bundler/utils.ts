import path from 'path';

const pkg = require(path.resolve(__dirname, '../..', 'package.json'));

export const version = pkg.version;

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isArray(val: unknown): val is any[] {
  return Array.isArray(val);
}

export function getDepsDir(dir: string) {
  return path.join(dir, 'deps');
}

export function getDllDir(dir: string) {
  return path.join(dir, 'current');
}

export function getDllPendingDir(dir: string) {
  return path.join(dir, 'pending');
}
