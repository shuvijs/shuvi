import WebpackChain from 'webpack-chain';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { baseWebpackChain, BaseOptions } from './base';
import { nodeExternals } from './parts/external';
import { withStyle } from './parts/style';
import { resolvePreferTarget } from './parts/resolve';

export interface NodeOptions extends BaseOptions {}

export function createNodeWebpackChain({
  ...baseOptions
}: NodeOptions): WebpackChain {
  const chain = baseWebpackChain(baseOptions);
  const { useTypeScript } = getTypeScriptInfo(baseOptions.projectRoot);

  chain.target('node');
  chain.devtool(false);
  const extensions = [
    ...(useTypeScript ? ['.tsx', '.ts'] : []),
    '.js',
    '.mjs',
    '.jsx',
    '.json',
    '.wasm'
  ];
  chain.resolve.extensions.merge(
    baseOptions.target
      ? resolvePreferTarget(baseOptions.target, extensions)
      : extensions
  );
  // fix: Can't reexport the named export 'BREAK' from non EcmaScript module
  // related issue: https://github.com/graphql/graphql-js/issues/1272
  chain.resolve.mainFields.clear().add('main').add('module');

  chain.output.libraryTarget('commonjs2');
  chain.optimization.minimize(false);
  chain.externals(nodeExternals({ projectRoot: baseOptions.projectRoot }));

  chain.module
    .rule('main')
    .oneOf('js')
    .use('babel-loader')
    .tap(options => ({
      ...options,
      isNode: true
    }));

  chain.plugin('private/build-manifest').tap(([options]) => [
    {
      ...options,
      modules: false
    }
  ]);

  return withStyle(chain, { ssr: true });
}
