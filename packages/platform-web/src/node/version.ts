import { resolvePkgFile } from './paths';

let version: string;

export function getVersion(): string {
  if (!version) {
    const pkg = require(resolvePkgFile('package.json'));
    version = pkg.version;
  }

  return version;
}
