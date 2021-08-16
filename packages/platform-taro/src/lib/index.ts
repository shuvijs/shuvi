// import React from 'react';
import { IApi, Runtime } from '@shuvi/types';
import { resolveAppFile, resolveDep, resolveLib } from './paths';
import { config as configBundler } from './bundler/config';
class PlatformTaro implements Runtime.IRuntime<any> {
  _api!: IApi;
  async install(api: IApi): Promise<void> {
    this._api = api;
    /* api.addAppFile({
      name: 'app.config.js',
      content: () => api.helpers.fileSnippets.moduleExportProxy(api.resolveUserFile('app.config.js'), true)
    }); */

    // todo parse runtime userAppConfig
    const appConfig = {
      pages: [
        'pages/index/index',
        'pages/sub/index',
        'pages/detail/index',
        'pages/list/index',
        'pages/my/index'
      ],
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
      }
    };

    appConfig.pages.forEach(page => {
      const pageFilePath = api.resolveUserFile(`${page}.jsx`);
      const pageConfigFilePath = api.resolveUserFile(`${page}.config.js`);
      api.addAppFile({
        name: `${page}.js`,
        content: () => `
        import { createPageConfig } from '@tarojs/runtime';
        import pageComponent from '${pageFilePath}'
        import pageConfig from '${pageConfigFilePath}'
        const inst = Page(createPageConfig(pageComponent, '${page}', {root:{cn:[]}}, pageConfig || {}))
        `
      });
    });

    api.addAppFile({
      name: 'app.js',
      content: () => `
      import '@binance/taro-plugin-platform-binance/dist/runtime';
      import { createReactApp, window } from '@tarojs/runtime';
      import app from '@shuvi/app/core/app';
      import appConfig from '${api.resolveUserFile('app.config.js')}';
      import { initPxTransform } from '@tarojs/taro';
      import React from 'react';
      import ReactDOM from 'react-dom';
      window.__taroAppConfig = appConfig;
      // const TypedAppComponent = AppComponent as React.ComponentClass;
      App(createReactApp(app, React, ReactDOM, appConfig));
      initPxTransform({
          designWidth: 750,
          deviceRatio: { '640': 1.17, '750': 1, '828': 0.905 }
      });
    `
    });

    api.addAppFile({
      name: 'comp.js',
      content: () => `
      import { createRecursiveComponentConfig } from '@tarojs/runtime'
      Component(createRecursiveComponentConfig())
    `
    });

    api.addAppFile({
      name: 'custom-wrapper.js',
      content: () => `
      import { createRecursiveComponentConfig } from '@tarojs/runtime'
      Component(createRecursiveComponentConfig('custom-wrapper'))
    `
    });

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

export default new PlatformTaro();
