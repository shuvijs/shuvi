import { join, dirname } from 'path';

const webpackResolveContext = join(
  dirname(require.resolve('webpack/package.json')),
  '../'
);

export * from './webpack';

/**
 * resolve webpack sub module from the same webpack module
 */
export function resolveWebpackModule(path: string) {
  if (!path.startsWith('webpack/')) {
    console.error('path need startWith "webpack/" to resolve webpack module');
  }
  return require(`${webpackResolveContext}/${path}`);
}
