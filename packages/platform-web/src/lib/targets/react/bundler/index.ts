import path from 'path';
import { ICliPluginConstructor, createCliPlugin } from '@shuvi/service';
import ReactRefreshWebpackPlugin from '@next/react-refresh-utils/ReactRefreshWebpackPlugin';
import { BUNDLER_DEFAULT_TARGET } from '@shuvi/shared/lib/constants';
import { PACKAGE_DIR } from '../../../paths';
import { BUILD_CLIENT_RUNTIME_REACT_REFRESH } from '../constants';

const configWebpack: ICliPluginConstructor['configWebpack'] = (
  config,
  { name },
  context
) => {
  const resolveLocal = (m: string, sub?: string) => {
    const pck = path.dirname(require.resolve(`${m}/package.json`));
    return sub ? `${pck}/${sub}` : pck;
  };
  const resolveUser = (m: string) =>
    path.join(context.paths.rootDir, 'node_modules', m);
  config.resolve.alias.set('@shuvi/platform-web', PACKAGE_DIR);
  config.resolve.alias.set('@shuvi/service', resolveLocal('@shuvi/service'));
  config.resolve.alias.set(
    '@shuvi/router-react$',
    resolveLocal('@shuvi/router-react')
  );
  config.resolve.alias.set('@shuvi/router$', resolveLocal('@shuvi/router'));
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
      .loader('@next/react-refresh-utils/loader')
      .before('shuvi-swc-loader');

    config.plugin('react-refresh-plugin').use(ReactRefreshWebpackPlugin);

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

const serverPlugin: ICliPluginConstructor['serverPlugin'] = context => {
  return require.resolve('./insertReactRefreshEntryFile');
};

export default createCliPlugin({
  configWebpack,
  serverPlugin
});
