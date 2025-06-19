const path = require('path');
const fs = require('fs');
const { baseWebpackChain } = require('@shuvi/toolpack/lib/webpack/config');

const chain = baseWebpackChain({
  dev: true,
  name: 'simple-webpack-project',
  projectRoot: __dirname,
  outputDir: path.resolve(__dirname, 'dist'),
  cacheDir: path.resolve(__dirname, '.cache'),
  include: [path.resolve(__dirname, 'src')],
  jsConfig: {
    useTypeScript: false,
    compilerOptions: {},
    resolvedBaseUrl: __dirname
  },
  env: {}
});

// Add TypeScript extensions to resolver
chain.resolve.extensions.merge(['.ts', '.tsx', '.js', '.jsx', '.json']);

fs.writeFileSync(
  path.resolve(__dirname, `.webpack.raw.js`),
  `module.export = ${chain.toString()}`,
  'utf8'
);

module.exports = chain.toConfig();
