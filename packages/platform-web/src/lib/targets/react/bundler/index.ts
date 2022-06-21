import * as path from 'path';
import { resolveLocal as _resolveLocal } from '@shuvi/utils/lib/resolve';
import { CorePluginConstructor, createPlugin } from '@shuvi/service';
import ReactRefreshWebpackPlugin from '@next/react-refresh-utils/ReactRefreshWebpackPlugin';
import { BUNDLER_DEFAULT_TARGET } from '@shuvi/shared/lib/constants';
import { PACKAGE_DIR } from '../../../paths';
import { BUILD_CLIENT_RUNTIME_REACT_REFRESH } from '../constants';
import serverPlugin from './insertReactRefreshEntryFile';
import { DefinePlugin } from 'webpack';

const configWebpack: CorePluginConstructor['configWebpack'] = (
  config,
  { name, webpack },
  context
) => {
  const resolveLocal = (id: string) =>
    _resolveLocal(id, { basedir: __dirname });
  const resolveUser = (m: string) =>
    path.join(context.paths.rootDir, 'node_modules', m);

  const isReactVersionAfter18 = () => {
    let version: string = '';
    try {
      version = require(resolveUser('react-dom')).version;
    } catch (e) {
      version = require(resolveLocal('react-dom')).version;
    } finally {
    }
    const majorVersion = parseInt(version.split('.')[0] || '', 10);

    return majorVersion >= 18;
  };

  config.resolve.alias.set('@shuvi/platform-web', PACKAGE_DIR);
  config.resolve.alias.set('@shuvi/service', resolveLocal('@shuvi/service'));
  config.resolve.alias.set(
    '@shuvi/router-react$',
    resolveLocal('@shuvi/router-react')
  );
  config.resolve.alias.set(
    '@shuvi/redox-react$',
    resolveLocal('@shuvi/redox-react')
  );
  // @ts-ignore
  config.resolve.alias.set('react$', [
    resolveUser('react'),
    resolveLocal('react')
  ]);
  // @ts-ignore
  config.resolve.alias.set('react-dom$', [
    resolveUser('react-dom'),
    resolveLocal('react-dom')
  ]);

  if (name === BUNDLER_DEFAULT_TARGET && context.mode === 'development') {
    config.module
      .rule('main')
      .oneOf('js')
      .use('react-refresh-loader')
      .loader(require.resolve('@next/react-refresh-utils/loader'))
      .before('shuvi-swc-loader');

    config
      .plugin('react-refresh-plugin')
      .use(ReactRefreshWebpackPlugin, [webpack]);
    config.plugin('version-env-plugin').use(DefinePlugin, [
      {
        'process.env.__SHUVI__AFTER__REACT__18__': JSON.stringify(
          isReactVersionAfter18()
        )
      }
    ]);
    config.merge({
      entry: {
        [BUILD_CLIENT_RUNTIME_REACT_REFRESH]: [
          require.resolve(`@next/react-refresh-utils/runtime`)
        ]
      }
    });
  }
  return config;
};

export default {
  core: createPlugin({
    configWebpack
  }),
  server: serverPlugin
};
