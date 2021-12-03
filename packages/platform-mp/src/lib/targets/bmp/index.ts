// import React from 'react';
import PlatformMpBase from '../../platform-mp-base';
import template from './template';

class PlatformMpBmp extends PlatformMpBase {
  globalObject = 'globalThis';
  taroComponentsPath = `${__dirname}/runtime/components-react`;
  entryPath = `${__dirname}/entry`;
  template: any = template;
  fileType = {
    templ: '.bxml',
    style: '.bxss',
    config: '.json',
    script: '.js',
    xs: '.bxs'
  };
}
export default PlatformMpBmp;
