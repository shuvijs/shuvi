// import React from 'react';
import PlatformMpBase from '../../platform-mp-base';
import template from './template';

//export default new PlatformTaro();
//import { PACKAGE_NAME } from './constants';
class PlatformMpBinance extends PlatformMpBase {
  globalObject = 'globalThis';
  runtimePath = `${__dirname}/runtime`;
  taroComponentsPath = `${__dirname}/runtime/components-react`;
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
