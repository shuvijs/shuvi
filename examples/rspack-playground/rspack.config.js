const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve('./', 'dist'),
    filename: '[name].js',
    clean: true
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react/jsx-dev-runtime': 'React',
    'react/jsx-runtime': 'React'
  },
  plugins: [
    new (require('@rspack/core').HtmlRspackPlugin)({
      template: './public/index.html'
    })
  ],
  experiments: {
    css: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true
              },
              transform: {
                react: {
                  runtime: 'classic'
                }
              },
              experimental: {
                plugins: [
                  [
                    require.resolve('@shuvi/plugin-remove-console'),
                    {
                      exclude: ['error']
                    }
                  ],
                  [
                    require.resolve('@shuvi/plugin-noop'),
                    {
                      enable: true
                    }
                  ],
                  [
                    require.resolve('@shuvi/plugin-auto-css-modules'),
                    { cssModuleFlag: 'cssmodules' }
                  ],
                  // TODO default is enabled??
                  // [
                  //   require.resolve('@shuvi/plugin-optimize-hook-destructuring'),
                  //   {
                  //   }
                  // ],
                  [
                    require.resolve(
                      '@shuvi/plugin-disallow-re-export-all-in-page'
                    ),
                    {
                      enabled: false
                    }
                  ]
                ]
              }
            }
          }
        }
      },
      {
        test: /\.css$/,
        type: 'css/auto'
      },
      {
        test: /\.less$/,
        type: 'css/auto',
        use: ['less-loader']
      },
      {
        test: /\.scss$/,
        type: 'css/auto',
        use: ['sass-loader']
      },
      {
        test: /\.sass$/,
        type: 'css/auto',
        use: [
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                indentedSyntax: true
              }
            }
          }
        ]
      }
    ]
  },
  devServer: {
    port: 3001,
    hot: true,
    open: true
  },
  infrastructureLogging: {
    level: 'verbose'
  }
};
