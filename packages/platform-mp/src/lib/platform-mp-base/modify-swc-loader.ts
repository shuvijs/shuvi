import { WebpackChain } from '@shuvi/toolpack/lib/webpack/config';

export default function modifySwcLoader(config: WebpackChain) {
  const shuviBabelLoader = config.module
    .rule('main')
    .oneOfs.get('js')
    .use('shuvi-swc-loader');
  const preBabelOptions = shuviBabelLoader.get('options');
  shuviBabelLoader.options({
    ...preBabelOptions,
    hasReactRefresh: false,
    dynamicImport: false,
    disableShuviDynamic: true
  });
}
