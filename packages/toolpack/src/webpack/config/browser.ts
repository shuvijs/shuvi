import crypto from "crypto";
import webpack from "webpack";
import WebpackChain from "webpack-chain";
import { getTypeScriptInfo } from "@shuvi/utils/lib/detectTypescript";
// import BuildManifestPlugin from "../plugins/build-manifest-plugin";
import { baseWebpackChain, BaseOptions } from "./base";
import { withStyle } from "./parts/style";
import { resolvePreferTarget } from "./parts/resolve";

const BIG_LIBRARY_THRESHOLD = 160000; // byte

export interface BrowserOptions extends BaseOptions {}

export function createBrowserWebpackChain({
  ...baseOptions
}: BrowserOptions): WebpackChain {
  const { dev, publicPath } = baseOptions;
  const chain = baseWebpackChain(baseOptions);
  const { useTypeScript } = getTypeScriptInfo(baseOptions.projectRoot);

  chain.target("web");
  chain.devtool(dev ? "cheap-module-source-map" : false);
  const extensions = [
    ...(useTypeScript ? [".tsx", ".ts"] : []),
    ".mjs",
    ".js",
    ".jsx",
    ".json",
    ".wasm"
  ];

  // TODO: use a resolver plugin to replace this
  chain.resolve.extensions.merge(
    baseOptions.target
      ? resolvePreferTarget(baseOptions.target, extensions)
      : extensions
  );
  if (dev) {
    chain.plugin("private/hmr-plugin").use(webpack.HotModuleReplacementPlugin);
  } else {
    chain.optimization.splitChunks({
      chunks: "all",
      cacheGroups: {
        default: false,
        vendors: false,
        framework: {
          chunks: "all",
          name: "framework",
          // This regex ignores nested copies of framework libraries so they're
          // bundled with their issuer.
          // https://github.com/zeit/next.js/pull/9012
          test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription|react-router|react-router-dom|react-router-config|history)[\\/]/,
          priority: 40,
          // Don't let webpack eliminate this chunk (prevents this chunk from
          // becoming a part of the commons chunk)
          enforce: true
        },
        lib: {
          test(module: { size: Function; identifier: Function }): boolean {
            return (
              module.size() > BIG_LIBRARY_THRESHOLD &&
              /node_modules[/\\]/.test(module.identifier())
            );
          },
          name(module: {
            type: string;
            libIdent?: Function;
            updateHash: (hash: crypto.Hash) => void;
          }): string {
            const hash = crypto.createHash("sha1");
            if (module.type === `css/mini-extract`) {
              module.updateHash(hash);
            } else {
              if (!module.libIdent) {
                throw new Error(
                  `Encountered unknown module type: ${module.type}. Please open an issue.`
                );
              }

              hash.update(
                module.libIdent({ context: baseOptions.projectRoot })
              );
            }

            return hash.digest("hex").substring(0, 8);
          },
          priority: 30,
          minChunks: 1,
          reuseExistingChunk: true
        },
        commons: {
          name: "commons",
          minChunks: 2,
          priority: 20
        },
        shared: {
          name(module: any, chunks: any) {
            return crypto
              .createHash("sha1")
              .update(
                chunks.reduce(
                  (acc: string, chunk: webpack.compilation.Chunk) => {
                    return acc + chunk.name;
                  },
                  ""
                )
              )
              .digest("hex");
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true
        }
      },
      maxInitialRequests: 12,
      minSize: 20000
    });
  }

  chain.plugin("define").tap(([options]) => [
    {
      ...options,
      // prevent errof of destructing process.env
      "process.env": JSON.stringify("{}")
    }
  ]);
  chain.plugin("private/build-manifest").tap(([options]) => [
    {
      ...options,
      modules: true
    }
  ]);

  return withStyle(chain, { extractCss: !dev, publicPath });
}
