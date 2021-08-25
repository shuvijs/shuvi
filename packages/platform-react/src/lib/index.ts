import React from 'react';
import { IApi, Runtime } from '@shuvi/types';
import { resolveAppFile, resolveDep, resolveLib } from './paths';
import { config as configBundler } from './bundler/config';

class ReactRuntime implements Runtime.IRuntime<React.ComponentType<any>> {
  _api!: IApi;
  async install(api: IApi): Promise<void> {
    this._api = api;
    api.addEntryCode('window.isBrowser = true');
    api.setPlatformModule(resolveAppFile('index'));
    // IE11 polyfill: https://github.com/facebook/create-react-app/blob/c38aecf73f8581db4a61288268be3a56b12e8af6/packages/react-app-polyfill/README.md#polyfilling-other-language-features
    api.addAppPolyfill(resolveDep('react-app-polyfill/ie11'));
    api.addAppPolyfill(resolveDep('react-app-polyfill/stable'));
    api.addAppExport(resolveAppFile('App'), '{ default as App }');
    api.addAppExport(resolveAppFile('head/head'), '{default as Head}');
    api.addAppExport(resolveAppFile('dynamic'), '{default as dynamic}');
    api.addAppExport(
      resolveLib('@shuvi/router-react'),
      '{ useParams, useRouter, useCurrentRoute, Link, RouterView, withRouter }'
    );
    configBundler(api);
  }
}

export default new ReactRuntime();
