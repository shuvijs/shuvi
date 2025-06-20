const RspackBuildManifestPlugin = require('../webpack/build-manifest-plugin.rspack');

/**
 * Example Rspack configuration demonstrating how to use RspackBuildManifestPlugin
 *
 * This configuration shows how to integrate the plugin with a typical Rspack setup
 * for a modern web application with code splitting and SSR support.
 */
module.exports = {
  // Entry points for the application
  entry: {
    main: './src/main.tsx',
    polyfills: './src/polyfills.ts'
  },

  // Output configuration
  output: {
    path: './dist',
    filename: 'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: true
  },

  // Module resolution
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': './src'
    }
  },

  // Module rules
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            sourceMap: true,
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true
              },
              transform: {
                react: {
                  runtime: 'automatic'
                }
              }
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          }
        ]
      }
    ]
  },

  // Optimization for code splitting
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },

  // Plugins
  plugins: [
    // RspackBuildManifestPlugin configuration
    new RspackBuildManifestPlugin({
      // Output filename for the manifest
      filename: 'build-manifest.json',

      // Include module information for better debugging
      modules: true,

      // Include chunk request information for route-based loading
      chunkRequest: true
    }),

    // Example of other common plugins you might use
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      )
    }),

    // HTML template plugin (if using)
    new rspack.HtmlRspackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      chunks: ['main', 'polyfills', 'runtime', 'vendors', 'common']
    })
  ],

  // Development server configuration
  devServer: {
    static: {
      directory: './dist'
    },
    hot: true,
    port: 3000,
    historyApiFallback: true
  },

  // Source maps for development
  devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,

  // Performance hints
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};

/**
 * Production-specific configuration
 * You can extend this configuration for production builds
 */
const productionConfig = {
  ...module.exports,

  mode: 'production',

  optimization: {
    ...module.exports.optimization,
    minimize: true,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ]
  },

  plugins: [
    ...module.exports.plugins,

    // Production-specific plugins
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};

/**
 * Usage examples:
 *
 * 1. Basic usage with default options:
 *    new RspackBuildManifestPlugin()
 *
 * 2. Custom filename:
 *    new RspackBuildManifestPlugin({
 *      filename: 'assets-manifest.json'
 *    })
 *
 * 3. Full configuration for SSR frameworks:
 *    new RspackBuildManifestPlugin({
 *      filename: 'build-manifest.json',
 *      modules: true,
 *      chunkRequest: true
 *    })
 *
 * 4. Integration with framework-specific configurations:
 *    // For Next.js-like frameworks
 *    new RspackBuildManifestPlugin({
 *      filename: '_next/static/build-manifest.json',
 *      modules: true,
 *      chunkRequest: true
 *    })
 */
