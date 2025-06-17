import { BaseOptions, baseRspackChain, RspackChain } from './base.rspack';
import { nodeExternals } from './parts/external';
import { withStyle } from './parts/style.rspack';
import { addExternals } from './parts/helpers.rspack';

export function createNodeRspackChain(options: BaseOptions): RspackChain {
  const { dev } = options;
  const chain = baseRspackChain(options);

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

  // Rspack uses output.library for node target
  chain.output.library({ type: 'commonjs2' });
  chain.optimization.minimize(false);

  /**
   * Use splitChunks.chunks = 'all' for node/server builds in Rspack.
   * This is the most compatible and recommended value for Rspack splitChunks.
   */
  chain.optimization.splitChunks({ chunks: 'all' });

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
