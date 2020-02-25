import { DEV_STYLE_ANCHOR_ID } from "@shuvi/shared/lib/constants";
import Config from "webpack-chain";
// @ts-ignore
import Rule from "webpack-chain/src/Rule";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import loaderUtils from "loader-utils";
import path from "path";

interface StyleOptions {
  publicPath?: string;
  extractCss?: boolean;
  sourceMap?: boolean;
  remove?: boolean;
}

function shouldUseRelativeAssetPaths(publicPath: string) {
  return publicPath === "./";
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
    ? "[folder]"
    : "[name]";
  // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
  const hash = loaderUtils.getHashDigest(
    // @ts-ignore
    path.posix.relative(context.rootContext, context.resourcePath) + localName,
    "md5",
    "base64",
    5
  );
  // Use loaderUtils to find the file or folder name
  const className = loaderUtils.interpolateName(
    context,
    fileNameOrFolder + "_" + localName + "__" + hash,
    options
  );
  // remove the .module that appears in every classname when based on the file.
  return className.replace(".module_", "_");
}

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

function cssRule({
  publicPath,
  test,
  cssModule,
  extractCss,
  sourceMap,
  scss
}: {
  publicPath?: string;
  test: any;
  cssModule?: boolean;
  extractCss?: boolean;
  sourceMap?: boolean;
  scss?: boolean;
}): Config.Rule {
  const rule = new Rule();
  rule.test(test);
  // A global CSS import always has side effects. Webpack will tree
  // shake the CSS without this option if the issuer claims to have
  // no side-effects.
  // See https://github.com/webpack/webpack/issues/6571
  rule.set("sideEffects", true);

  if (extractCss) {
    rule
      .use("extract-loader")
      .loader(MiniCssExtractPlugin.loader)
      .options({
        ...(publicPath && shouldUseRelativeAssetPaths(publicPath)
          ? {
              // path relative to outdir from the generated css file
              publicPath: "../../"
            }
          : {})
      });
  } else {
    rule
      .use("style-loader")
      .loader(require.resolve("style-loader"))
      .options({
        insertAt: {
          before: `#${DEV_STYLE_ANCHOR_ID}`
        }
      });
  }

  rule
    .use("css-loader")
    .loader(require.resolve("css-loader"))
    .options({
      sourceMap,
      importLoaders: scss ? 2 : 1,
      ...(cssModule && {
        modules: true,
        getLocalIdent: getCSSModuleLocalIdent
      })
    });

  rule
    .use("postcss-loader")
    .loader(require.resolve("postcss-loader"))
    .options({
      sourceMap,
      // Necessary for external CSS imports to work
      // https://github.com/facebook/create-react-app/issues/2677
      ident: "postcss",
      plugins: () => [
        // Make Flexbox behave like the spec cross-browser.
        require("postcss-flexbugs-fixes"),
        // Run Autoprefixer and compile new CSS features.
        require("postcss-preset-env")({
          autoprefixer: {
            flexbox: "no-2009"
          },
          stage: 3
        })
      ]
    });

  if (scss) {
    rule
      .use("sass-loader")
      .loader(require.resolve("sass-loader"))
      .options({
        sourceMap
      });
  }

  return rule;
}

export function withStyle(
  chain: Config,
  { extractCss, sourceMap, remove, publicPath }: StyleOptions
): Config {
  const oneOfs = chain.module.rule("main").oneOfs;
  if (remove) {
    const ignoreRule = new Rule();
    ignoreRule
      .test([cssRegex, cssModuleRegex, sassRegex, sassModuleRegex])
      .use("ignore-loader")
      .loader(require.resolve("ignore-loader"))
      .after("js");
    oneOfs.set("ignore", ignoreRule);
    return chain;
  }

  if (extractCss) {
    chain.plugin("mini-css-extract-plugin").use(MiniCssExtractPlugin, [
      {
        filename: "static/css/[contenthash:8].css",
        chunkFilename: "static/css/[contenthash:8].chunk.css"
      }
    ]);
  }

  oneOfs.set(
    "css",
    // @ts-ignore
    cssRule({
      test: cssRegex,
      cssModule: false,
      scss: false,
      extractCss,
      sourceMap,
      publicPath
    }).after("js")
  );
  oneOfs.set(
    "css-module",
    // @ts-ignore
    cssRule({
      test: cssModuleRegex,
      cssModule: true,
      scss: false,
      extractCss,
      sourceMap,
      publicPath
    }).after("css")
  );
  oneOfs.set(
    "scss",
    // @ts-ignore
    cssRule({
      test: sassRegex,
      cssModule: false,
      scss: true,
      extractCss,
      sourceMap,
      publicPath
    }).after("css-module")
  );
  oneOfs.set(
    "scss-module",
    // @ts-ignore
    cssRule({
      test: sassModuleRegex,
      cssModule: true,
      scss: true,
      extractCss,
      sourceMap,
      publicPath
    }).after("scss")
  );

  return chain;
}
