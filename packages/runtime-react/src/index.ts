import React from 'react';
import { IApi, Runtime, APIHooks } from '@shuvi/types';
import { resolveDist, resolveDep } from './paths';
import { matchRoutes } from './router/matchRoutes';
import { config as configBundler } from './bundler/config';

import RouteConfig = Runtime.IRouteConfig;

class ReactRuntime implements Runtime.IRuntime<React.ComponentType<any>> {
  private _api!: IApi;

  async install(api: IApi): Promise<void> {
    this._api = api;

    api.addAppPolyfill(resolveDep('react-app-polyfill/ie11'));
    api.addAppExport(resolveDist('head/head'), {
      imported: 'default',
      local: 'Head'
    });
    api.addAppExport(resolveDist('dynamic'), {
      imported: 'default',
      local: 'dynamic'
    });
    api.addAppExport(
      'react-router-dom',
      '{ Link, useLocation, useParams, useHistory, useRouteMatch, withRouter }'
    );

    configBundler(api);

    // add necessary imports
    api.tap<APIHooks.IHookAppRoutesFile>('app:routesFile', {
      name: 'runtime-react',
      fn: fileContent => {
        return `
import { loadRouteComponent } from '${resolveDist('loadRouteComponent')}';
${fileContent}
`.trim();
      }
    });
  }

  componentTemplate(
    componentModule: string,
    route: RouteConfig & { id: string }
  ) {
    return `
loadRouteComponent(() => import(/* webpackChunkName: "page-${route.id}" */"${componentModule}"), {
  webpack: () => [require.resolveWeak("${componentModule}")],
  modules: ["${componentModule}"],
})`.trim();
  }

  matchRoutes(routes: RouteConfig[], pathname: string) {
    return matchRoutes(routes, pathname);
  }

  getServerRendererModulePath(): string {
    return resolveDist('renderer');
  }

  getClientRendererModulePath(): string {
    let {
      ssr,
      router: { history }
    } = this._api.config;

    if (history === 'auto') {
      history = ssr ? 'browser' : 'hash';
    }

    if (history === 'hash') {
      return resolveDist('clientRender.hash');
    }

    return resolveDist('clientRender.browser');
  }

  getAppModulePath(): string {
    return resolveDist('App');
  }

  get404ModulePath(): string {
    return resolveDist('page404');
  }

  getRouterModulePath(): string {
    return resolveDist('router/router');
  }
}

export default new ReactRuntime();
