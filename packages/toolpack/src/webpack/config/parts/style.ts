import { DEV_STYLE_ANCHOR_ID } from '@shuvi/shared/lib/constants';
import { WebpackChain as Config } from '../base';
import Rule from 'webpack-chain/src/Rule';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as loaderUtils from 'loader-utils';
import * as path from 'path';
import { shouldUseRelativeAssetPaths } from './helpers';

interface StyleOptions {
  filename: string;
  chunkFilename: string;
  publicPath?: string;
  extractCss?: boolean;
  sourceMap?: boolean;
  ssr?: boolean;
  lightningCss?: boolean;
}

function getCSSModuleLocalIdent(
  context: any,
  localIdentName: string,
  localName: string,
  options: any
) {
  // Use the filename or folder name, based on some uses the index.js / index.module.(css|scss|sass) project style
  const fileNameOrFolder = context.resourcePath.match(
    /index\.module\.(css|scss|sass)$/
  )
    ? '[folder]'
    : '[name]';
  // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
  const hash = loaderUtils.getHashDigest(
    // @ts-ignore
    path.posix.relative(context.rootContext, context.resourcePath) + localName,
    'md5',
    'base64',
    5
  );
  // Use loaderUtils to find the file or folder name
  const className = loaderUtils.interpolateName(
    context,
    fileNameOrFolder + '_' + localName + '__' + hash,
    options
  );
  // remove the .module that appears in every classname when based on the file.
  return className.replace('.module_', '_');
}

// style files regexes
const cssRegex = /\.css$/;
const cssModuleQueryRegex = /cssmodules/;
const sassRegex = /\.(scss|sass)$/;

function ssrCssRule({
  test,
  resourceQuery,
  scss,
  lightningCss
}: {
  test: any;
  resourceQuery?: any;
  scss?: boolean;
  lightningCss?: boolean;
}): Config.Rule {
  const rule: Config.Rule = new Rule();
  rule.test(test);
  if (resourceQuery) {
    rule.resourceQuery(resourceQuery);
  }

  if (lightningCss) {
    rule
      .use('lightningcss-loader')
      .loader('@shuvi/lightningcss-loader')
      .options({
        sourceMap: false,
        importLoaders: scss ? 1 : 0,
        esModule: true,
        modules: {
          exportOnlyLocals: true
        }
      });
  } else {
    rule
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options({
        sourceMap: false,
        importLoaders: scss ? 1 : 0,
        esModule: true,
        modules: {
          getLocalIdent: getCSSModuleLocalIdent,
          exportOnlyLocals: true
        }
      });
  }

  if (scss) {
    rule
      .use('sass-loader')
      .loader(require.resolve('sass-loader'))
      .options({
        sourceMap: false,
        sassOptions: {
          outputStyle: 'expanded'
        }
      });
  }

  return rule;
}

function cssRule({
  publicPath,
  test,
  resourceQuery,
  cssModule,
  lightningCss,
  extractCss,
  sourceMap,
  scss
}: {
  publicPath?: string;
  test: any;
  resourceQuery?: any;
  cssModule?: boolean;
  lightningCss?: boolean;
  extractCss?: boolean;
  sourceMap?: boolean;
  scss?: boolean;
}): Config.Rule {
  const rule: Config.Rule = new Rule();
  rule.test(test);
  if (resourceQuery) {
    rule.resourceQuery(resourceQuery);
  }

  // A global CSS import always has side effects. Webpack will tree
  // shake the CSS without this option if the issuer claims to have
  // no side-effects.
  // See https://github.com/webpack/webpack/issues/6571
  rule.set('sideEffects', true);

  if (extractCss) {
    rule
      .use('extract-loader')
      .loader(MiniCssExtractPlugin.loader)
      .options({
        ...(publicPath && shouldUseRelativeAssetPaths(publicPath)
          ? {
              // path relative to outdir from the generated css file
              publicPath: '../../'
            }
          : {})
      });
  } else {
    rule
      .use('style-loader')
      .loader(require.resolve('style-loader'))
      .options({
        insert: new Function(
          'element',
          `
          // These elements should always exist. If they do not,
          // this code should fail.
          var anchorElement = document.querySelector("#${DEV_STYLE_ANCHOR_ID}");
          var parentNode = anchorElement.parentNode; // Normally <head>

          // Each style tag should be placed right before our
          // anchor. By inserting before and not after, we do not
          // need to track the last inserted element.
          parentNode.insertBefore(element, anchorElement);
        `
        ),
        esModule: true
      });
  }

  if (lightningCss) {
    rule
      .use('lightningcss-loader')
      .loader('@shuvi/lightningcss-loader')
      .options({
        sourceMap,
        importLoaders: scss ? 2 : 1,
        esModule: true,
        ...(cssModule && {
          modules: {}
        })
      });
  } else {
    rule
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options({
        sourceMap,
        importLoaders: scss ? 2 : 1,
        esModule: true,
        ...(cssModule && {
          modules: {
            getLocalIdent: getCSSModuleLocalIdent
            // exportOnlyLocals: true,
          }
        })
      });

    rule
      .use('postcss-loader')
      .loader(require.resolve('postcss-loader'))
      .options({
        sourceMap,
        postcssOptions: {
          plugins: [
            // Make Flexbox behave like the spec cross-browser.
            require('postcss-flexbugs-fixes'),
            // Run Autoprefixer and compile new CSS features.
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009'
              },
              stage: 3
            })
          ]
        }
      });
  }

  if (scss) {
    rule
      .use('sass-loader')
      .loader(require.resolve('sass-loader'))
      .options({
        sourceMap,
        sassOptions: {
          outputStyle: 'expanded'
        }
      });
  }

  return rule;
}

export function withStyle(
  chain: Config,
  {
    extractCss,
    sourceMap,
    ssr,
    publicPath,
    lightningCss,
    filename,
    chunkFilename
  }: StyleOptions
): Config {
  const oneOfs = chain.module.rule('main').oneOfs;
  if (ssr) {
    oneOfs.set(
      'css-module',
      // @ts-ignore
      ssrCssRule({
        test: cssRegex,
        resourceQuery: cssModuleQueryRegex,
        scss: false,
        lightningCss
      }).after('js')
    );
    oneOfs.set(
      'scss-module',
      // @ts-ignore
      ssrCssRule({
        test: sassRegex,
        resourceQuery: cssModuleQueryRegex,
        scss: true,
        lightningCss
      }).after('css-module')
    );
    const ignoreRule: Config.Rule = new Rule();
    ignoreRule
      .test([cssRegex, sassRegex])
      .use('ignore-loader')
      .loader(require.resolve('ignore-loader'))
      .end()
      .after('scss-module');
    // @ts-ignore
    oneOfs.set('ignore', ignoreRule);
    return chain;
  }

  if (extractCss) {
    chain.plugin('mini-css-extract-plugin').use(MiniCssExtractPlugin, [
      {
        filename,
        chunkFilename
      }
    ]);
  }

  oneOfs.set(
    'css-module',
    // @ts-ignore
    cssRule({
      test: cssRegex,
      resourceQuery: cssModuleQueryRegex,
      cssModule: true,
      lightningCss,
      scss: false,
      extractCss,
      sourceMap,
      publicPath
    }).after('js')
  );
  oneOfs.set(
    'css',
    // @ts-ignore
    cssRule({
      test: cssRegex,
      cssModule: false,
      lightningCss,
      scss: false,
      extractCss,
      sourceMap,
      publicPath
    }).after('css-module')
  );
  oneOfs.set(
    'scss-module',
    // @ts-ignore
    cssRule({
      test: sassRegex,
      resourceQuery: cssModuleQueryRegex,
      cssModule: true,
      lightningCss,
      scss: true,
      extractCss,
      sourceMap,
      publicPath
    }).after('css')
  );
  oneOfs.set(
    'scss',
    // @ts-ignore
    cssRule({
      test: sassRegex,
      cssModule: false,
      lightningCss,
      scss: true,
      extractCss,
      sourceMap,
      publicPath
    }).after('scss-module')
  );

  return chain;
}
