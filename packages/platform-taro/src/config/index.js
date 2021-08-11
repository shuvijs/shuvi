const resolve = require('resolve');
const path = require('path');
const fs = require('fs');

const resolveModule = (name, basedir) => {
  let resolvedFile;
  try {
    resolvedFile = path.dirname(resolve.sync(name, { basedir }));
  } catch (_error) {
    resolvedFile = name;
  }
  return resolvedFile;
};

const resolveUserMoudle = name => {
  let resolved;
  try {
    resolved = resolveModule(name, process.cwd());
  } catch (_error) {
    try {
      resolved = resolveModule(name, __dirname);
    } catch (__error) {
      resolved = name;
    }
  }

  return resolved;
};
const resolveInternalMoudle = name => resolveModule(name, __dirname);

const config = {
  entry: { app: ['./src/app'] },
  projectName: 'bmp-project-name-placeholder',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: '.bmp/build',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  mini: {
    postcss: {
      pxtransform: {
        enable: false,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    debugReact: true,
    alias: {
      '@binance/mp-service': '@tarojs/taro',
      '@binance/mp-components': '@tarojs/components',
      '@binance/mp-api': '@tarojs/api',
      // make sure only one version of react exsit
      '@tarojs/react': '@tarojs/react',
      'react-dom$': '@tarojs/react',
      // 'react-reconciler$': resolveModule('react-reconciler'),
      'react-reconciler$':
        'react-reconciler/cjs/react-reconciler.production.min.js',
      react$: resolveUserMoudle('react'),
      scheduler$: resolveUserMoudle('scheduler'),
      'react/jsx-runtime$': resolveUserMoudle('react/jsx-runtime'),

      '@binance/http': path.resolve(
        __dirname,
        '../dist/adapters/http/index.js'
      ),
      '@binance/fetch': path.resolve(__dirname, '../dist/adapters/fetch.js'),
      'i18next-browser-languagedetector': path.resolve(
        __dirname,
        '../dist/adapters/i18n/LanguageDetector/index.js'
      )
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
};

module.exports = function (merge) {
  let appConfig = {};

  const appPath = process.cwd();
  const configDirPath = path.join(appPath, 'bmp.config');
  if (fs.existsSync(configDirPath)) {
    const {
      defineConstants,
      sourceRoot,
      framework,
      ...others
    } = require(configDirPath);
    appConfig = {
      framework,
      defineConstants,
      sourceRoot: sourceRoot || config.sourceRoot,
      mini: {
        ...others
      }
    };
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'), appConfig);
  }
  return merge({}, config, require('./prod'), appConfig);
};
