import { UnRecursiveTemplate } from '@tarojs/shared/dist/template';

export class BmpTemplate extends UnRecursiveTemplate {
  supportXS = false;
  Adapter = {
    if: 'bn:if',
    else: 'bn:else',
    elseif: 'bn:elif',
    for: 'bn:for',
    forItem: 'bn:for-item',
    forIndex: 'bn:for-index',
    key: 'bn:key',
    xs: 'bxs',
    type: 'bmp'
  };

  constructor() {
    super();
    this.filterIdAttribute();
  }

  buildXsTemplate() {
    return '<bxs module="xs" src="./utils.bxs" />';
  }

  private superBuildTemplate = this.buildTemplate;
  buildTemplate: UnRecursiveTemplate['buildTemplate'] = componentConfig => {
    componentConfig.includeAll = true;
    return this.superBuildTemplate(componentConfig);
  };

  private filterIdAttribute() {
    // `id` attribute will cause duplicate attribute error in vue-core-compiler
    Object.keys(this.internalComponents).forEach(key => {
      delete this.internalComponents[key]['id'];
    });
  }
}
