import WebpackChain = require('webpack-chain');
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { baseWebpackChain, BaseOptions } from './base';
import { nodeExternals } from './parts/external';
import { withStyle } from './parts/style';
import { resolvePreferTarget } from './parts/resolve';
import { IWebpackHelpers } from '../types';

export interface NodeOptions extends BaseOptions {
  webpackHelpers: IWebpackHelpers;
}

export function createNodeWebpackChain({
  webpackHelpers,
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
  webpackHelpers.addExternals(
    chain,
    nodeExternals({
      projectRoot: baseOptions.projectRoot,
      include: baseOptions.include
    })
  );

  chain.module
    .rule('main')
    .oneOf('js')
    .use('shuvi-swc-loader')
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

  chain.plugin('define').tap(([options]) => [
    {
      ...options,
      __BROWSER__: false
    }
  ]);

  return withStyle(chain, { ssr: true, parcelCss: baseOptions.parcelCss });
}
