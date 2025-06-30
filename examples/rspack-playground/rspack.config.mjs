import path from 'path';

const removeConsolePluginPath = path.resolve(
  '../../rust-packages/remove-console/swc_plugin_remove_console.wasm'
);

const noopPluginPath = path.resolve(
  '../../rust-packages/noop/swc_plugin_noop.wasm'
);

const autoCssModulesPluginPath = path.resolve(
  '../../rust-packages/auto-css-modules/swc_plugin_auto_css_modules.wasm'
);

const disallowReExportAllInPagePluginPath = path.resolve(
  '../../rust-packages/disallow-re-export-all-in-page/swc_plugin_disallow_re_export_all_in_page.wasm'
);

export default {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve('./', 'dist'),
    filename: '[name].js',
    clean: true
  },
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
                  runtime: 'automatic'
                }
              },
              experimental: {
                plugins: [
                  [
                    removeConsolePluginPath,
                    {
                      exclude: ['error']
                    }
                  ],
                  [
                    noopPluginPath,
                    {
                      enable: true
                    }
                  ],
                  [autoCssModulesPluginPath, { cssModuleFlag: 'cssmodules' }],
                  [disallowReExportAllInPagePluginPath, {
                    enabled: false
                  }]
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
