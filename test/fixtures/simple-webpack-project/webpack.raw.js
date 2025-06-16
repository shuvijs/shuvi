module.export = {
  mode: 'development',
  bail: false,
  context: '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project',
  cache: {
    cacheDirectory:
      '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project/.cache/webpack/cb18fc519b81368e2f322ecbbec22a13',
    type: 'filesystem',
    name: 'simple-webpack-project-development',
    version: '1.0.63|'
  },
  watchOptions: {
    aggregateTimeout: 5,
    ignored: ['**/.git/**']
  },
  infrastructureLogging: {
    level: 'none'
  },
  output: {
    path: '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project/dist',
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: 'static/chunks/[name].js',
    hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
    hotUpdateMainFilename:
      'static/webpack/[runtime].[fullhash].hot-update.json',
    strictModuleExceptionHandling: true,
    webassemblyModuleFilename: 'static/wasm/[modulehash:8].wasm',
    hashFunction: 'xxhash64',
    hashDigestLength: 16
  },
  resolve: {
    alias: {
      '@swc/helpers':
        '/Users/michael/code/shuvi/node_modules/.pnpm/@swc+helpers@0.4.3/node_modules/@swc/helpers'
    },
    modules: [
      'node_modules',
      '/Users/michael/code/shuvi/node_modules/.pnpm/webpack@5.73.0_webpack-cli@5.1.4/node_modules/webpack/bin/node_modules',
      '/Users/michael/code/shuvi/node_modules/.pnpm/webpack@5.73.0_webpack-cli@5.1.4/node_modules/webpack/node_modules',
      '/Users/michael/code/shuvi/node_modules/.pnpm/webpack@5.73.0_webpack-cli@5.1.4/node_modules',
      '/Users/michael/code/shuvi/node_modules/.pnpm/node_modules'
    ],
    plugins: [
      /* config.resolve.plugin('jsconfig-paths-plugin') */
      new JsConfigPathsPlugin(
        {},
        '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project'
      )
    ]
  },
  resolveLoader: {
    alias: {
      '@shuvi/lightningcss-loader':
        '/Users/michael/code/shuvi/packages/toolpack/lib/webpack/loaders/lightningcss-loader',
      '@shuvi/shuvi-swc-loader':
        '/Users/michael/code/shuvi/packages/toolpack/lib/webpack/loaders/shuvi-swc-loader',
      '@shuvi/empty-loader':
        '/Users/michael/code/shuvi/packages/toolpack/lib/webpack/loaders/empty-loader',
      '@shuvi/route-component-loader':
        '/Users/michael/code/shuvi/packages/toolpack/lib/webpack/loaders/route-component-loader'
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      /* config.module.rule('main') */
      {
        oneOf: [
          /* config.module.rule('main').oneOf('js') */
          {
            test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
            include: [
              '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project/src'
            ],
            use: [
              /* config.module.rule('main').oneOf('js').use('shuvi-swc-loader') */
              {
                loader: '@shuvi/shuvi-swc-loader',
                options: {
                  isServer: false,
                  compiler: undefined,
                  supportedBrowsers: false,
                  swcCacheDir:
                    '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project/.cache/swc'
                }
              }
            ]
          },
          /* config.module.rule('main').oneOf('media') */
          {
            type: 'asset/resource',
            generator: {
              filename: function () {
                /* omitted long function */
              }
            },
            exclude: [/\.(tsx|ts|js|cjs|mjs|jsx)$/, /\.html$/, /\.json$/]
          }
        ]
      },
      /* config.module.rule('webpackPatch') */
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      /* config.module.rule('private/shuvi-runtime') */
      {
        test: /\.shuvi[/\\]app[/\\]runtime[/\\]index\.(js|ts)/,
        sideEffects: false
      }
    ]
  },
  optimization: {
    emitOnErrors: false,
    checkWasmTypes: false,
    nodeEnv: false,
    minimize: false,
    realContentHash: false,
    usedExports: false
  },
  plugins: [
    /* config.plugin('private/ignore-plugin') */
    new IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    /* config.plugin('private/define') */
    new DefinePlugin({
      __SHUVI_DEFINE_ENV: 'true'
    }),
    /* config.plugin('define') */
    new DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    /* config.plugin('private/fix-watching-plugin') */
    new FixWatchingPlugin()
  ],
  performance: {
    hints: false
  }
};
