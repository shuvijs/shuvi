import { WebpackChain, baseWebpackChain, BaseOptions } from './base';
import { nodeExternals } from './parts/external';
import { withStyle } from './parts/style';
import { addExternals, getDefaultSplitChunksConfig } from './parts/helpers';

export function createNodeWebpackChain(options: BaseOptions): WebpackChain {
  const { dev } = options;
  const chain = baseWebpackChain(options);

  chain.target('node');
  chain.devtool(dev ? 'cheap-module-source-map' : false);
  chain.resolve.extensions.merge([
    '.ts',
    '.tsx',
    '.js',
    '.mjs',
    '.jsx',
    '.json',
    '.wasm'
  ]);

  chain.output.libraryTarget('commonjs2');
  chain.optimization.minimize(false);

  // use default splitChunks config
  chain.optimization.splitChunks(getDefaultSplitChunksConfig(dev));

  addExternals(
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

  chain.plugin('define').tap(([options]) => [
    {
      ...options,
      __BROWSER__: false,
      /**
       * swc.optimizer can't handle `typeof window` correctly for dependencies
       */
      'typeof window': JSON.stringify('undefined')
    }
  ]);

  return withStyle(chain, {
    ssr: true,
    lightningCss: options.lightningCss,
    filename: 'static/css/[contenthash:8].css',
    chunkFilename: 'static/css/[contenthash:8].chunk.css'
  });
}
