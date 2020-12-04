import path from 'path';
import { IApi, APIHooks } from '@shuvi/types';
// @ts-ignore
import AliasPlugin from 'enhanced-resolve/lib/AliasPlugin';
import ReactRefreshWebpackPlugin from '@next/react-refresh-utils/ReactRefreshWebpackPlugin';
import {
  BUNDLER_TARGET_CLIENT,
  BUILD_CLIENT_RUNTIME_REACT_REFRESH
} from '@shuvi/shared/lib/constants';
import { PACKAGE_DIR } from '../paths';

export function config(api: IApi) {
  const resolveLocal = (m: string) =>
    path.dirname(require.resolve(`${m}/package.json`));
  const resolveUser = (m: string) =>
    path.join(api.paths.rootDir, 'node_modules', m);
  api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
    name: 'runtime-react',
    fn: (config, { name }) => {
      // const oriExternal = config.get("externals");
      // const external: webpack.ExternalsFunctionElement = (
      //   context,
      //   request,
      //   callback
      // ) => {
      //   const externals = [
      //     /@shuvi[/\/]runtime-react[/\/]lib[/\/]loadble/,
      //     /@shuvi[/\/]runtime-react[/\/]es[/\/]loadble/
      //   ];

      //   function external() {
      //     return callback(null, `commonjs ${request}`);
      //   }

      //   if (externals.some(test => test.test(request))) {
      //     return external();
      //   }
      // };

      // config.externals(external);
      // make sure we don't have multiple entity of following packages , becasue module variable will fail
      config.resolve.alias.set('@shuvi/runtime-react', PACKAGE_DIR);
      config.resolve.alias.set(
        '@shuvi/router-react$',
        resolveLocal('@shuvi/router-react')
      );
      config.resolve.alias.set('@shuvi/router$', resolveLocal('@shuvi/router'));

      // WEBPACK5: using alias in webpack5
      config.resolve.plugin('react-alias').use(AliasPlugin, [
        'described-resolve',
        [
          {
            name: 'react',
            onlyModule: true,
            alias: [resolveUser('react'), resolveLocal('react')]
          },
          {
            name: 'react-dom',
            onlyModule: true,
            alias: [resolveUser('react-dom'), resolveLocal('react-dom')]
          }
        ],
        'resolve'
      ]);

      if (name === BUNDLER_TARGET_CLIENT && api.mode === 'development') {
        config.module
          .rule('main')
          .oneOf('js')
          .use('react-refresh-loader')
          .loader('@next/react-refresh-utils/loader')
          .before('shuvi-babel-loader');

        config.plugin('react-refresh-plugin').use(ReactRefreshWebpackPlugin);

        config.module
          .rule('main')
          .oneOf('js')
          .use('shuvi-babel-loader')
          .tap(options => ({ ...options, hasReactRefresh: true }));

        config.merge({
          entry: {
            [BUILD_CLIENT_RUNTIME_REACT_REFRESH]: [
              require.resolve(`@next/react-refresh-utils/runtime`)
            ]
          }
        });
      }
      return config;
    }
  });
}
