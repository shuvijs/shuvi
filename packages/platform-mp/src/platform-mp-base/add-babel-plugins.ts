import { WebpackChain } from '@shuvi/toolpack/lib/webpack/config';

export default function addBabelPlugins(config: WebpackChain) {
  const shuviBabelLoader = config.module
    .rule('main')
    .oneOfs.get('js')
    .use('shuvi-babel-loader');
  const preBabelOptions = shuviBabelLoader.get('options');
  shuviBabelLoader.options({
    ...preBabelOptions,
    plugins: [
      ...(preBabelOptions.plugins ?? []),
      require('./babel-plugins/import-to-require')
    ]
  });
}
