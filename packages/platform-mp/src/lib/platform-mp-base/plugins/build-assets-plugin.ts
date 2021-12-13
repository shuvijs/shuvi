import { AppConfigs, IFileType } from '../types';
import { IPaths } from '@shuvi/service/lib/api';
import webpack, { Compiler, Compilation, sources } from 'webpack';
import path from 'path';
import fs from 'fs';
import { promoteRelativePath } from '@tarojs/helper';
import {
  UnRecursiveTemplate,
  RecursiveTemplate
} from '@tarojs/shared/dist/template';
import { componentConfig } from '../template/component';
const { RawSource } = webpack.sources;
interface CompilationAssets {
  [index: string]: sources.Source;
}

interface BuildAssetsPluginOptions {
  appConfigs: AppConfigs;
  paths: IPaths;
  fileType: IFileType;
  themeFilePath: string;
  template: UnRecursiveTemplate | RecursiveTemplate;
}

const getFullName = (fileName: string, ext: string) => {
  const extName = path.extname(fileName);
  if (extName) {
    return fileName.replace(extName, ext);
  }
  return fileName + ext;
};

// add extra asset files
export default class BuildAssetsPlugin {
  appConfigs: AppConfigs;
  paths: IPaths;
  fileType: IFileType;
  themeFilePath: string;
  template: UnRecursiveTemplate | RecursiveTemplate;
  constructor(options: BuildAssetsPluginOptions) {
    this.appConfigs = options.appConfigs;
    this.paths = options.paths;
    this.themeFilePath = options.themeFilePath;
    this.fileType = options.fileType;
    this.template = options.template;
  }

  getFullTemplateFileName(fileName: string) {
    return getFullName(fileName, this.fileType.templ);
  }
  getFullStyleFileName(fileName: string) {
    return getFullName(fileName, this.fileType.style);
  }
  getFullConfigFileName(fileName: string) {
    return getFullName(fileName, this.fileType.config);
  }
  getFullXsFileName(fileName: string) {
    return getFullName(fileName, this.fileType.xs);
  }

  generateTemplateFile(
    assets: CompilationAssets,
    fileName: string,
    templateFn: (...args: any[]) => string,
    ...options: any[]
  ) {
    const name = this.getFullTemplateFileName(fileName);
    let content = templateFn(...options);
    assets[name] = new RawSource(content, true);
  }

  generateConfigFile(assets: CompilationAssets, fileName: string, config: any) {
    const name = this.getFullConfigFileName(fileName);
    const unOfficalConfigs = [
      'enableShareAppMessage',
      'enableShareTimeline',
      'components'
    ];
    unOfficalConfigs.forEach(item => {
      delete config[item];
    });
    let content = JSON.stringify(config);
    assets[name] = new RawSource(content, true);
  }

  generateXSFile(assets: CompilationAssets, fileName: string) {
    const name = this.getFullXsFileName(fileName);
    const content = this.template.buildXScript();
    assets[name] = new RawSource(content, true);
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
          const { tabBar } = this.appConfigs.app;
          const list = (tabBar && tabBar.list) || [];

          list.forEach(item => {
            if (item.iconPath) {
              const realIconPath = path.join(this.paths.srcDir, item.iconPath);
              if (fs.existsSync(realIconPath)) {
                assets[item.iconPath] = new RawSource(
                  fs.readFileSync(realIconPath)
                );
              }
            }
            if (item.selectedIconPath) {
              const realIconPath = path.join(
                this.paths.srcDir,
                item.selectedIconPath
              );
              if (fs.existsSync(realIconPath)) {
                assets[item.selectedIconPath] = new RawSource(
                  fs.readFileSync(realIconPath)
                );
              }
            }
          });

          const baseTemplateName = 'base';
          const baseCompName = 'comp';
          const customWrapperName = 'custom-wrapper';
          this.generateTemplateFile(
            assets,
            baseTemplateName,
            this.template.buildTemplate,
            componentConfig
          );
          this.generateXSFile(assets, 'utils'); // must be executed after `template.buildTemplate`

          this.generateTemplateFile(
            assets,
            baseCompName,
            this.template.buildBaseComponentTemplate,
            this.fileType.templ
          );

          this.generateTemplateFile(
            assets,
            customWrapperName,
            this.template.buildCustomComponentTemplate,
            this.fileType.templ
          );

          this.generateConfigFile(assets, 'app', this.appConfigs.app);

          const baseCompConfig = {
            component: true,
            usingComponents: {
              [baseCompName]: `./${baseCompName}`,
              [customWrapperName]: `./${customWrapperName}`
            }
          };
          this.generateConfigFile(assets, baseCompName, baseCompConfig);
          this.generateConfigFile(assets, customWrapperName, baseCompConfig);
          compilation.chunks.forEach(chunk => {
            if (/^pages\//.test(chunk.name)) {
              const importBaseTemplatePath = promoteRelativePath(
                path.relative(
                  chunk.name,
                  baseTemplateName + this.fileType.templ
                )
              );
              const importBaseCompPath = promoteRelativePath(
                path.relative(chunk.name, baseCompName)
              );
              const importCustomWrapperPath = promoteRelativePath(
                path.relative(chunk.name, customWrapperName)
              );
              const pageConfig = this.appConfigs[chunk.name] || {};
              this.generateConfigFile(assets, chunk.name, {
                ...pageConfig,
                usingComponents: {
                  [baseCompName]: importBaseCompPath,
                  [customWrapperName]: importCustomWrapperPath
                }
              });
              this.generateTemplateFile(
                assets,
                chunk.name,
                this.template.buildPageTemplate,
                importBaseTemplatePath
              );
            }
          });
        }
      );
    });
  }
}
