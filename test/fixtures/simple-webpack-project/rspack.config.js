const path = require('path');
const fs = require('fs');
const {
  baseRspackChain
} = require('@shuvi/toolpack/lib/webpack/config/base.rspack');
// const {
//   createBrowserRspackChain
// } = require('@shuvi/toolpack/lib/webpack/config/browser.rspack');
// const {
//   createNodeRspackChain
// } = require('@shuvi/toolpack/lib/webpack/config/node.rspack');

const chain = baseRspackChain({
  dev: true,
  name: 'simple-webpack-project',
  projectRoot: __dirname,
  outputDir: path.resolve(__dirname, 'dist'),
  cacheDir: path.resolve(__dirname, '.cache'),
  include: [path.resolve(__dirname, 'src')]
});

// Add TypeScript extensions to resolver
chain.resolve.extensions.merge(['.ts', '.tsx', '.js', '.jsx', '.json']);

fs.writeFileSync(
  path.resolve(__dirname, `.rspack.raw.js`),
  `module.export = ${chain.toString()}`,
  'utf8'
);

module.exports = chain.toConfig();
