import * as path from 'path';
import type { Configuration } from '@rspack/core';
import { HtmlRspackPlugin } from '@rspack/core';

// Use a more flexible type that allows for Rspack's experimental features
const config: Configuration = {
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
    new HtmlRspackPlugin({
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
    parser: {
      'css/module': {
        namedExports: false
      }
    },
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
        type: 'css/module'
      },
      {
        test: /\.less$/,
        type: 'css/module',
        use: ['less-loader']
      },
      {
        test: /\.scss$/,
        type: 'css/module',
        use: ['sass-loader']
      },
      {
        test: /\.sass$/,
        type: 'css/module',
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

export default config;
