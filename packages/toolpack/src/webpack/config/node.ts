import { WebpackChain, baseWebpackChain, BaseOptions } from './base';
import { nodeExternals } from './parts/external';
import { withStyle } from './parts/style';
import { IWebpackHelpers } from '../types';

export interface NodeOptions extends BaseOptions {
  webpackHelpers: IWebpackHelpers;
}

export function createNodeWebpackChain(options: NodeOptions): WebpackChain {
  const { webpackHelpers, typescript } = options;
  const chain = baseWebpackChain(options);
  const useTypeScript = !!typescript?.useTypeScript;

  chain.target('node');
  chain.devtool(false);
  chain.resolve.extensions.merge([
    ...(useTypeScript ? ['.ts', '.tsx'] : []),
    '.js',
    '.mjs',
    '.jsx',
    '.json',
    '.wasm'
  ]);
  // fix: Can't reexport the named export 'BREAK' from non EcmaScript module
  // related issue: https://github.com/graphql/graphql-js/issues/1272
  chain.resolve.mainFields.clear().add('main').add('module');

  chain.output.libraryTarget('commonjs2');
  chain.optimization.minimize(false);
  webpackHelpers.addExternals(
    chain,
    nodeExternals({
      projectRoot: options.projectRoot,
      include: options.include
    })
  );

  chain.module
    .rule('main')
    .oneOf('js')
    .use('shuvi-swc-loader')
    .tap(options => ({
      ...options,
      isServer: true
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

  return withStyle(chain, {
    ssr: true,
    parcelCss: options.parcelCss,
    filename: 'static/css/[contenthash:8].css',
    chunkFilename: 'static/css/[contenthash:8].chunk.css'
  });
}
