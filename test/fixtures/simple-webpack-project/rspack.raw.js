module.export = {
  mode: 'development',
  devtool: 'source-map',
  cache: {
    type: 'filesystem',
    cacheDirectory:
      '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project/.cache'
  },
  output: {
    path: '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project/dist',
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      '/Users/michael/code/shuvi/test/fixtures/simple-webpack-project/src',
      'node_modules'
    ]
  },
  module: {
    rules: [
      /* config.module.rule('js') */
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          /* config.module.rule('js').use('swc-loader') */
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'ecmascript'
                },
                target: 'es2015'
              },
              sourceMaps: false
            }
          }
        ]
      }
    ]
  },
  entry: {
    main: ['./src/index.js']
  }
};
