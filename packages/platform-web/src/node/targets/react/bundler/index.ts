import * as path from 'path';
import { CorePluginConstructor, createPlugin } from '@shuvi/service';
import ReactRefreshWebpackPlugin from '@next/react-refresh-utils/ReactRefreshWebpackPlugin';
import { resolveLocal } from '../../../paths';
import { BUNDLER_TARGET_CLIENT } from '../../../../shared';

const isDefined = <T>(value: T | undefined): value is T => Boolean(value);

const configWebpack: CorePluginConstructor['configWebpack'] = (
  config,
  { name, webpack },
  context
) => {
  const resolveUser = (m: string, sub?: string) => {
    const { rootDir } = context.paths;
    let userPkg: { dependencies: Record<string, string> } = {
      dependencies: {}
    };
    // Check if target dependency is declared at user's package.json
    try {
      userPkg = require(path.join(rootDir, `package.json`));
      if (!userPkg.dependencies) {
        userPkg.dependencies = {};
      }
    } catch {}

    if (m in userPkg.dependencies) {
      // Resolve path of target dependency from user root path
      try {
        const module = sub ? `${m}/${sub}` : m;
        return require.resolve(module, { paths: [rootDir] });
      } catch {}
    }
    return undefined;
  };

  const isReactVersionAfter18 = () => {
    let version: string = '';
    try {
      const userReactDomPkgPath = resolveUser('react-dom', 'package.json');
      if (userReactDomPkgPath) {
        version = require(userReactDomPkgPath).version;
      }
    } catch {}
    if (!version) {
      version = require(resolveLocal('react-dom')).version;
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
  config.resolve.alias.set(
    'react$',
    // @ts-ignore
    [resolveUser('react'), resolveLocal('react')].filter(isDefined)
  );
  config.resolve.alias.set(
    'react/jsx-runtime$',
    // @ts-ignore
    [
      resolveUser('react', 'jsx-runtime'),
      resolveLocal('react', 'jsx-runtime')
    ].filter(isDefined)
  );
  config.resolve.alias.set(
    'react/jsx-dev-runtime$',
    // @ts-ignore
    [
      resolveUser('react', 'jsx-dev-runtime'),
      resolveLocal('react', 'jsx-dev-runtime')
    ].filter(isDefined)
  );
  config.resolve.alias.set(
    'react-dom$',
    // @ts-ignore
    [resolveUser('react-dom'), resolveLocal('react-dom')].filter(isDefined)
  );

  if (name === BUNDLER_TARGET_CLIENT) {
    config.plugin('version-env-plugin').use(webpack.DefinePlugin, [
      {
        'process.env.__SHUVI__AFTER__REACT__18__': JSON.stringify(
          isReactVersionAfter18()
        )
      }
    ]);

    if (context.mode === 'development') {
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
