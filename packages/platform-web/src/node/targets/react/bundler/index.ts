import * as path from 'path';
import { CorePluginConstructor, createPlugin } from '@shuvi/service';
import ReactRefreshWebpackPlugin from '@next/react-refresh-utils/ReactRefreshWebpackPlugin';
import { BUNDLER_DEFAULT_TARGET } from '@shuvi/shared/lib/constants';

const configWebpack: CorePluginConstructor['configWebpack'] = (
  config,
  { name, webpack },
  context
) => {
  const resolveLocal = (m: string, sub?: string) => {
    const pck = path.dirname(require.resolve(`${m}/package.json`));
    return sub ? `${pck}/${sub}` : pck;
  };
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

  config.resolve.alias.set('@shuvi/service', resolveLocal('@shuvi/service'));
  config.resolve.alias.set('@shuvi/router$', resolveLocal('@shuvi/router'));
  config.resolve.alias.set(
    '@shuvi/router-react$',
    resolveLocal('@shuvi/router-react')
  );

  // @ts-ignore
  config.resolve.alias.set('react$', [
    resolveUser('react'),
    resolveLocal('react')
  ]);
  // @ts-ignore
  config.resolve.alias.set('react/jsx-runtime$', [
    resolveUser('react/jsx-runtime'),
    resolveLocal('react', 'jsx-runtime')
  ]);
  // @ts-ignore
  config.resolve.alias.set('react/jsx-dev-runtime$', [
    resolveUser('react/jsx-dev-runtime'),
    resolveLocal('react', 'jsx-dev-runtime')
  ]);
  // @ts-ignore
  config.resolve.alias.set('react-dom$', [
    resolveUser('react-dom'),
    resolveLocal('react-dom')
  ]);

  if (name === BUNDLER_DEFAULT_TARGET) {
    config.plugin('version-env-plugin').use(webpack.DefinePlugin, [
      {
        'process.env.__SHUVI__AFTER__REACT__18__': JSON.stringify(
          isReactVersionAfter18()
        )
      }
    ]);

    if (context.mode === 'development') {
      config.module
        .rule('main')
        .oneOf('js')
        .use('react-refresh-loader')
        .loader(require.resolve('@next/react-refresh-utils/loader'))
        .before('shuvi-swc-loader');

      config
        .plugin('react-refresh-plugin')
        .use(ReactRefreshWebpackPlugin, [webpack]);
    }
  }
  return config;
};

export default {
  core: createPlugin({
    configWebpack,
    addEntryCode(context) {
      if (context.mode === 'development') {
        const fastRefreshRuntime = require.resolve(
          `@next/react-refresh-utils/runtime`
        );
        return `import "${fastRefreshRuntime}"`;
      } else {
        return '';
      }
    }
  })
};
