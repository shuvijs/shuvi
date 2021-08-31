import { createReactApp, window } from '@tarojs/runtime';
// @ts-ignore
import appConfig from '@shuvi/user/app.config';
import { initPxTransform } from '@tarojs/taro';
import React from 'react';
import ReactDOM from 'react-dom';
export default {
  // @ts-ignore
  renderApp({ AppComponent }) {
    window.__taroAppConfig = appConfig;
    // @ts-ignore
    App(createReactApp(AppComponent, React, ReactDOM, appConfig));
    initPxTransform({
      designWidth: 750,
      deviceRatio: { '640': 1.17, '750': 1, '828': 0.905 }
    });
  }
};
