import React from 'react';
import ReactDOM from 'react-dom';
import appConfig from './app.config';
import app from '@shuvi/app/core/app';

import '@binance/taro-plugin-platform-binance/dist/runtime';
import '@binance/mp-components';
import { createReactApp, window } from '@tarojs/runtime';
import { initPxTransform } from '@tarojs/taro';
declare let App: any;
const config = {
  pages: ['pages/index/index', 'pages/sub/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
};
(window as any).__taroAppConfig = appConfig;
// const TypedAppComponent = AppComponent as React.ComponentClass;
(window as any).App(createReactApp(app, React, ReactDOM, config));
initPxTransform({
  designWidth: 750,
  deviceRatio: { '640': 1.17, '750': 1, '828': 0.905 }
});
