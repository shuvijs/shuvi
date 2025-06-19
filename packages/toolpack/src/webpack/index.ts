import { join, dirname } from 'path';

const rspackResolveContext = join(
  dirname(require.resolve('@rspack/core/package.json')),
  '../'
);
console.debug(`[rspack][rspackResolveContext] ${rspackResolveContext}`);

export * from './rspack';

/**
 * resolve rspack sub module from the same rspack module
 * @unsupported Rspack does not support submodule resolution like Webpack.
 * TODO: Remove or replace after Rspack support is available.
 */
export function resolveRspackModule(path: string) {
  if (!path.startsWith('@rspack/core/')) {
    console.error(
      'path need startWith "@rspack/core/" to resolve rspack module'
    );
  }
  const p = require(`${rspackResolveContext}/${path}`);
  // debug
  console.debug(`[rspack][resolveRspackModule] ${path} -> ${p}`);
  return p;
}
