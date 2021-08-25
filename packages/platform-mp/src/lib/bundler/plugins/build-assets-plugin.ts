//import { AppConfig } from '@tarojs/taro';
import { AppConfig, PageConfigs } from '../config';
import { IPaths } from '@shuvi/types';
import webpack, { Compiler, Compilation } from 'webpack';
import path from 'path';
import fs from 'fs';
import { promoteRelativePath } from '@tarojs/helper';
// import { RawSource, Source } from 'webpack-sources'
const { RawSource } = webpack.sources;

const baseTemplateName = 'base.bxml';
const baseCompName = 'comp';
const customWrapperName = 'custom-wrapper';
interface BuildAssetsPluginOptions {
  appConfig: AppConfig;
  pageConfigs: PageConfigs;
  paths: IPaths;
  themeFilePath: string;
}
// add extra asset files
export default class BuildAssetsPlugin {
  appConfig: AppConfig;
  pageConfigs: PageConfigs;
  paths: IPaths;
  themeFilePath: string;
  constructor(options: BuildAssetsPluginOptions) {
    this.appConfig = options.appConfig;
    this.pageConfigs = options.pageConfigs;
    this.paths = options.paths;
    this.themeFilePath = options.themeFilePath;
  }

  apply(compiler: Compiler) {
    compiler.hooks.make.tap('BuildAssetsPlugin', (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'BuildAssetsPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        assets => {
          const themeFilePath = this.themeFilePath;
          if (themeFilePath && fs.existsSync(themeFilePath)) {
            const themeContent = fs.readFileSync(themeFilePath);
            assets['theme.json'] = new RawSource(themeContent, true);
          }
          // todo custom tabBar 支持
          const { tabBar } = this.appConfig;
          const list = (tabBar && tabBar.list) || [];
          list.forEach(item => {
            if (item.iconPath) {
              const realIconPath = path.join(this.paths.srcDir, item.iconPath);
              assets[item.iconPath] = new RawSource(
                fs.readFileSync(realIconPath)
              );
            }
            if (item.selectedIconPath) {
              const realIconPath = path.join(
                this.paths.srcDir,
                item.selectedIconPath
              );
              assets[item.selectedIconPath] = new RawSource(
                fs.readFileSync(realIconPath)
              );
            }
            /* item['iconPath'] && this.tabBarIcons.add(item['iconPath'])
            // eslint-disable-next-line dot-notation
            item['selectedIconPath'] && this.tabBarIcons.add(item['selectedIconPath']) */
          });
          // todo set real file contents by user file
          assets['app.json'] = new RawSource(
            JSON.stringify(this.appConfig),
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
            JSON.stringify({
              component: true,
              usingComponents: {
                [baseCompName]: './comp',
                [customWrapperName]: './custom-wrapper'
              }
            })
          );

          compilation.chunks.forEach(chunk => {
            if (/^pages\//.test(chunk.name)) {
              const importBaseTemplatePath = promoteRelativePath(
                path.relative(chunk.name, baseTemplateName)
              );
              const importBaseCompPath = promoteRelativePath(
                path.relative(chunk.name, baseCompName)
              );
              const importCustomWrapperPath = promoteRelativePath(
                path.relative(chunk.name, customWrapperName)
              );
              const jsonName = chunk.name + '.json';
              const xmlName = chunk.name + '.bxml';
              /* assets[jsonName] = new RawSource(
                '{"navigationBarTitleText":"首页","usingComponents":{"custom-wrapper":"../../custom-wrapper","comp":"../../comp"}}',
                true
              ); */
              const pageConfig = this.pageConfigs[chunk.name] || {};
              assets[jsonName] = new RawSource(
                JSON.stringify({
                  ...pageConfig,
                  usingComponents: {
                    [baseCompName]: importBaseCompPath,
                    [customWrapperName]: importCustomWrapperPath
                  }
                }),
                true
              );
              assets[xmlName] = new RawSource(
                `<import src="${importBaseTemplatePath}"/>
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
