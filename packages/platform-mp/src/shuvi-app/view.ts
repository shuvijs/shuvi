import { createReactApp, window } from '@tarojs/runtime';
// @ts-ignore
import appConfig from '@shuvi/user/app.config';
import { initPxTransform } from '@tarojs/taro';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
export default {
  // @ts-ignore
  renderApp({ AppComponent }) {
    // @ts-ignore
    window.__taroAppConfig = appConfig;
    // @ts-ignore
    App(createReactApp(AppComponent, React, ReactDOM, appConfig));
    initPxTransform({
      designWidth: 750,
      deviceRatio: { '640': 1.17, '750': 1, '828': 0.905 }
    });
  }
};
