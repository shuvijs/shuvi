import webpack, { Compiler, Compilation } from 'webpack';
const { RawSource } = webpack.sources;

// add extra asset files
export default class BuildAssetsPlugin {
  constructor() {}

  apply(compiler: Compiler) {
    compiler.hooks.make.tap('BuildAssetsPlugin', (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'BuildAssetsPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        assets => {
          // todo set real file contents by user file
          assets['app.json'] = new RawSource(
            '{"pages":["pages/index/index","pages/sub/index"],"window":{"backgroundTextStyle":"light","navigationBarBackgroundColor":"#fff","navigationBarTitleText":"WeChat","navigationBarTextStyle":"black"}}',
            true
          );
          assets['base.bxml'] = new RawSource('', true);
          assets['comb.bxml'] = new RawSource(
            `<import src="./base.bxml" />
          <template is="tmpl_0_container" data="{{i:i}}" />`,
            true
          );
          assets['comp.js'] = new RawSource('', true);
          assets['comp.json'] = new RawSource(
            '{"component":true,"usingComponents":{"comp":"./comp","custom-wrapper":"./custom-wrapper"}}',
            true
          );
          assets['custom-wrapper.bxml'] = new RawSource(
            `<import src="./base.bxml" />
          <block bn:for="{{i.cn}}" bn:key="uid">
            <template is="tmpl_0_container" data="{{i:item}}" />
          </block>`,
            true
          );
          assets['custom-wrapper.js'] = new RawSource('', true);
          assets['custom-wrapper.json'] = new RawSource(
            '{"component":true,"usingComponents":{"comp":"./comp","custom-wrapper":"./custom-wrapper"}}',
            true
          );

          compilation.chunks.forEach(chunk => {
            if (/^pages\//.test(chunk.name)) {
              const jsonName = chunk.name + '.json';
              const xmlName = chunk.name + '.bxml';
              assets[jsonName] = new RawSource(
                '{"navigationBarTitleText":"首页","usingComponents":{"custom-wrapper":"../../custom-wrapper","comp":"../../comp"}}',
                true
              );
              assets[xmlName] = new RawSource(
                `<import src="../../base.bxml"/>
              <template is="taro_tmpl" data="{{root:root}}" />`,
                true
              );
            }
          });
        }
      );
    });
  }
}
