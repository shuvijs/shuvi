const path = require('path');
const RspackChain = require('rspack-chain');

/**
 * baseRspackChain - 建立一個基礎 RspackChain 配置
 * @param {Object} options
 * @param {boolean} options.dev - 是否為開發模式
 * @param {string} options.name - 構建名稱
 * @param {string} options.projectRoot - 專案根目錄
 * @param {string} options.outputDir - 輸出目錄
 * @param {string} options.cacheDir - 快取目錄
 * @param {string[]} options.include - 需要包含的目錄
 * @param {Object} [options.jsConfig] - JS 配置
 * @param {Object} [options.env] - 環境變數
 */
module.exports = function baseRspackChain({
  dev = true,
  name = 'app',
  projectRoot = process.cwd(),
  outputDir = path.resolve(process.cwd(), 'dist'),
  cacheDir = path.resolve(process.cwd(), '.cache'),
  include = [path.resolve(process.cwd(), 'src')],
  jsConfig = {},
  env = {}
} = {}) {
  const chain = new RspackChain();

  chain.mode(dev ? 'development' : 'production');
  chain.name(name);

  chain.entry('main').add(path.resolve(projectRoot, 'src/index.js'));

  chain.output.path(outputDir).filename('[name].js').clean(true);

  chain.devtool('source-map');

  chain.module
    .rule('js')
    .test(/\.js$/)
    .include.add(...include)
    .end()
    .exclude.add(/node_modules/)
    .end()
    .use('swc-loader')
    .loader('builtin:swc-loader')
    .options({
      jsc: {
        parser: { syntax: 'ecmascript' },
        target: 'es2015'
      },
      sourceMaps: false
    });

  chain.cache({
    type: 'filesystem',
    cacheDirectory: cacheDir
  });

  chain.resolve.extensions.add('.js');
  chain.resolve.modules
    .add(path.resolve(projectRoot, 'src'))
    .add('node_modules');

  return chain;
};
