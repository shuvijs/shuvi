// import React from 'react';
import PlatformMpBase from '@shuvi/platform-mp/lib/platform-mp-base';
import template from './template';
import { IApi, Runtime } from '@shuvi/types';

//export default new PlatformTaro();
import { PACKAGE_NAME } from './constants';
class PlatformMpBinance extends PlatformMpBase {
  globalObject = 'globalThis';
  runtimePath = `${PACKAGE_NAME}/lib/runtime`;
  template: any = template;
  fileType = {
    templ: '.bxml',
    style: '.bxss',
    config: '.json',
    script: '.js',
    xs: '.bxs'
  };
}
export default PlatformMpBinance;
