import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { shouldUseRelativeAssetPaths } from '@shuvi/toolpack/lib/webpack/config';
import { WebpackChain } from '@shuvi/toolpack/lib/webpack/config';

// 1 scss-loader 特殊设置
//     1.1 全局注入 scss 文件--没有实现，感觉没用
//     sassOption.additionalData = await getBundleContent(resource, projectDirectory)
//     1.2 特殊的配置--已经实现
//     sourceMap: true,
//     implementation: sass,
//     sassOptions: {
//       outputStyle: 'expanded', // 不压缩
//         fiber: false,
//         让 sass 文件里的 @import 能解析小程序原生样式文体，如 @import "a.wxss";
//         importer (url: string, prev: string, done: (...arg:any[])=>void): any {}
//     }
// 2 resolve-url-loader 感觉没用 https://www.npmjs.com/package/resolve-url-loader
//     sass: {
//       test: /\.sass$/,
//         oneOf: addCssLoader(cssLoaders, resolveUrlLoader, sassLoader)
//     },
// 3 CSS Modules 默认不支持
//     namingPattern 配置取值分别如下：
//       global，表示全局转换，所有样式文件都会经过 CSS Modules 转换处理，除了文件名中包含 .global. 的样式文件
//       module，表示自定义转换，只有文件名中包含 .module. 的样式文件会经过 CSS Modules 转换处理generateScopedName 支持传入字符串和函数：
// 4 postcss 插件
//     autoprefixer // 我们使用postcss-preset-env实现该功能，但是未配置browsers，自动添加前缀未生效
//     postcss-pxtransform // 转rpx 已实现
//     postcss-html-transform // 1:html => .h5-html 2: remove cursor
//     postcss-url // inline-source 已实现
//     postcss-import import from node_modules // 没有实现，感觉没用

function generateMiniCssExtractPluginOptions(
  extension: string
): [MiniCssExtractPlugin.PluginOptions] {
  return [
    {
      filename: function (pathData: any) {
        return `${pathData.chunk!.name}${extension}`;
      }
    }
  ];
}

export default function ensureExtractLoader(
  config: WebpackChain,
  extension: string = '.bxss'
) {
  const oneOfs = config.module.rule('main').oneOfs;
  const publicPath = config.output.get('publicPath');
  const ruleList = ['css-module', 'css', 'scss-module', 'scss'];
  ruleList.forEach(ruleName => {
    const ruleUses = oneOfs.get(ruleName).uses;
    if (ruleUses.get('style-loader')) {
      // replace style-loader to extract-loader
      ruleUses
        .delete('style-loader')
        .end()
        .use('extract-loader')
        .loader(MiniCssExtractPlugin.loader)
        .options({
          ...(publicPath && shouldUseRelativeAssetPaths(publicPath)
            ? {
                // path relative to outdir from the generated css file
                publicPath: '../../'
              }
            : {})
        })
        .before('css-loader');
    }
    if (ruleUses.get('postcss-loader')) {
      ruleUses.get('postcss-loader').tap(args => {
        return {
          sourceMap: args.sourceMap,
          postcssOptions: {
            plugins: [
              ...args.postcssOptions.plugins,
              require('postcss-url')({
                limit: 1000,
                url: 'inline'
              })
            ]
          }
        };
      });
    }
    if (ruleUses.get('sass-loader')) {
      ruleUses.get('sass-loader').tap(args => {
        return {
          ...args,
          sourceMap: true
        };
      });
    }
  });

  const plugins = config.plugins.get('mini-css-extract-plugin');

  if (plugins) {
    plugins.tap(args => generateMiniCssExtractPluginOptions(extension));
  } else {
    config
      .plugin('mini-css-extract-plugin')
      .use(
        MiniCssExtractPlugin,
        generateMiniCssExtractPluginOptions(extension)
      );
  }
}
