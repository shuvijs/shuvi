import path from 'path';
import { IApi, APIHooks } from '@shuvi/types';
import ReactRefreshWebpackPlugin from '@next/react-refresh-utils/ReactRefreshWebpackPlugin';
import { BUNDLER_TARGET_CLIENT } from '@shuvi/shared/lib/constants';
import { PACKAGE_DIR } from '../paths';
import { BUILD_CLIENT_RUNTIME_REACT_REFRESH } from '../constants';

export function config(api: IApi) {
  const resolveLocal = (m: string, sub?: string) => {
    const pck = path.dirname(require.resolve(`${m}/package.json`));
    return sub ? `${pck}/${sub}` : pck;
  };
  const resolveUser = (m: string) =>
    path.join(api.paths.rootDir, 'node_modules', m);
  api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
    name: 'platform-react',
    fn: (config, { name }) => {
      // const oriExternal = config.get("externals");
      // const external: webpack.ExternalsFunctionElement = (
      //   context,
      //   request,
      //   callback
      // ) => {
      //   const externals = [
      //     /@shuvi[/\/]platform-react[/\/]lib[/\/]loadble/,
      //     /@shuvi[/\/]platform-react[/\/]es[/\/]loadble/
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
      config.resolve.alias.set('@shuvi/platform-web-react', PACKAGE_DIR);
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
          .tap(options => {
            const plugins = options.plugins || [];
            plugins.unshift([
              require('react-refresh/babel'),
              { skipEnvCheck: true }
            ]);

            return {
              ...options,
              plugins
            };
          });

        config.merge({
          entry: {
            [BUILD_CLIENT_RUNTIME_REACT_REFRESH]: [
              require.resolve(`@next/react-refresh-utils/runtime`)
            ]
          }
        });

        api.tap<APIHooks.IHookModifyHtml>('modifyHtml', {
          name: 'insertReactRefreshEntryFile',
          fn: documentProps => {
            documentProps.scriptTags.unshift({
              tagName: 'script',
              attrs: {
                src: api.getAssetPublicUrl(
                  BUILD_CLIENT_RUNTIME_REACT_REFRESH + '.js'
                )
              }
            });
            return documentProps;
          }
        });
      }
      return config;
    }
  });
}
