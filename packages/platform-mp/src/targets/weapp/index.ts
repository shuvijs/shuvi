import { recursiveMerge } from '@tarojs/helper';
import PlatformMpBase from '../../platform-mp-base';
import template from './template';
import { components } from './runtime/components';
class PlatformMpWeapp extends PlatformMpBase {
  globalObject = 'wx';
  template: any = template;
  fileType = {
    templ: '.wxml',
    style: '.wxss',
    config: '.json',
    script: '.js',
    xs: '.wxs'
  };
  entryPath = `${__dirname}/entry`;
  taroComponentsPath = `${__dirname}/runtime/components-react`;
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
