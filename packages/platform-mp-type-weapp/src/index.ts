// import React from 'react';
import PlatformMpBase from '@shuvi/platform-mp/lib/platform-mp-base';
import template from './template';
import { IApi, Runtime } from '@shuvi/types';
import { recursiveMerge } from '@tarojs/helper';
import { components } from './runtime/components';
//export default new PlatformTaro();
import { PACKAGE_NAME } from './constants';
class PlatformMpWeapp extends PlatformMpBase {
  globalObject = 'wx';
  runtimePath = `${PACKAGE_NAME}/lib/runtime`;
  template: any = template;
  fileType = {
    templ: '.wxml',
    style: '.wxss',
    config: '.json',
    script: '.js',
    xs: '.wxs'
  };
  modifyTemplate() {
    recursiveMerge(template.internalComponents, components);
    this.template.voidElements.add('voip-room');
    this.template.voidElements.delete('textarea');
    this.template.focusComponents.add('editor');
  }
  install() {
    this.modifyTemplate();
    this.setupApp();
    this.setupRoutes();
    this.configWebpack();
  }
}
export default PlatformMpWeapp;
