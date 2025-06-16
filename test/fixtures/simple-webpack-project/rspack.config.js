const path = require('path');
const fs = require('fs');
const RspackChain = require('rspack-chain');

const chain = new RspackChain();

chain.mode('development');

chain.entry('main').add('./src/index.js');

chain.output
  .path(path.resolve(__dirname, 'dist'))
  .filename('[name].js')
  .clean(true);

chain.devtool('source-map');

chain.module
  .rule('js')
  .test(/\.js$/)
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
  cacheDirectory: path.resolve(__dirname, '.cache')
});

chain.resolve.extensions.add('.js');
chain.resolve.modules.add(path.resolve(__dirname, 'src')).add('node_modules');

fs.writeFileSync(
  path.resolve(__dirname, `rspack.raw.js`),
  `module.export = ${chain.toString()}`,
  'utf8'
);

module.exports = chain.toConfig();
