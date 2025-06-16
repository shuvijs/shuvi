const path = require('path');
const fs = require('fs');
const baseRspackChain = require('./baseRspackChain');

const chain = baseRspackChain({
  dev: true,
  name: 'simple-webpack-project',
  projectRoot: __dirname,
  outputDir: path.resolve(__dirname, 'dist'),
  cacheDir: path.resolve(__dirname, '.cache'),
  include: [path.resolve(__dirname, 'src')]
});

fs.writeFileSync(
  path.resolve(__dirname, `.rspack.raw.js`),
  `module.export = ${chain.toString()}`,
  'utf8'
);

module.exports = chain.toConfig();
