import path from 'path';
import { IApi, APIHooks } from '@shuvi/types';
// @ts-ignore
import AliasPlugin from 'enhanced-resolve/lib/AliasPlugin';
import { PACKAGE_DIR } from '../paths';

export function config(api: IApi) {
  const resolveLocal = (m: string) => require.resolve(m);
  const resolveUser = (m: string) =>
    path.join(api.paths.rootDir, 'node_modules', m);
  api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
    name: 'runtime-react',
    fn: config => {
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
        'react-router-dom$',
        resolveLocal('react-router-dom')
      );
      config.resolve.alias.set('react-router$', resolveLocal('react-router'));

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
      return config;
    }
  });
}
