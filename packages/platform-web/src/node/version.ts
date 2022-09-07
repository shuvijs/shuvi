//import { resolvePkgFile } from './paths';
let version: string = require('../../package.json').version;

export function getVersion(): string {
  // todo: 还不清楚为什么Package.json module not found,用NODE全路径引入什可以德
  //
  // if (!version) {
  //   const pkg = require(resolvePkgFile('package.json'));
  //   version = pkg.version;
  // }

  return version;
}
