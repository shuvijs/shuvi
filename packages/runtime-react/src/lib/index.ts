import React from 'react';
import { IApi, Runtime, APIHooks } from '@shuvi/types';
import { resolveAppFile, resolveDep, resolveLib } from './paths';
import { config as configBundler } from './bundler/config';

import UserRouteConfig = Runtime.IUserRouteConfig;

class ReactRuntime implements Runtime.IRuntime<React.ComponentType<any>> {
  private _api!: IApi;

  async install(api: IApi): Promise<void> {
    this._api = api;

    // IE11 polyfill: https://github.com/facebook/create-react-app/blob/c38aecf73f8581db4a61288268be3a56b12e8af6/packages/react-app-polyfill/README.md#polyfilling-other-language-features
    api.addAppPolyfill(resolveDep('react-app-polyfill/ie11'));
    api.addAppPolyfill(resolveDep('react-app-polyfill/stable'));

    api.addAppExport(resolveAppFile('head/head'), '{default as Head}');
    api.addAppExport(resolveAppFile('dynamic'), '{default as dynamic}');
    api.addAppExport(
      resolveLib('@shuvi/router-react'),
      '{ useParams, useRouter, useCurrentRoute, Link, RouterView, withRouter }'
    );
    configBundler(api);

    // add necessary imports
    api.tap<APIHooks.IHookAppRoutesFile>('app:routesFile', {
      name: 'runtime-react',
      fn: fileContent => {
        return `
import { loadRouteComponent } from '${resolveAppFile('loadRouteComponent')}';
${fileContent}
`.trim();
      }
    });
  }

  componentTemplate(
    componentModule: string,
    route: UserRouteConfig & { id: string }
  ) {
    return `
loadRouteComponent(() => import(/* webpackChunkName: "page-${route.id}" */"${componentModule}"), {
  webpack: () => [require.resolveWeak("${componentModule}")],
  modules: ["${componentModule}"],
})`.trim();
  }

  getViewModulePath(): string {
    let {
      ssr,
      router: { history }
    } = this._api.config;

    if (history === 'auto') {
      history = ssr ? 'browser' : 'hash';
    }

    if (history === 'hash') {
      return resolveAppFile('index.hash');
    }

    return resolveAppFile('index.browser');
  }

  getAppModulePath(): string {
    return resolveAppFile('App');
  }

  get404ModulePath(): string {
    return resolveAppFile('page404');
  }
}

export default new ReactRuntime();
