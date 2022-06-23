input options

#### webpack

```javascript
mainFields: ['browser', 'module', 'jsnext:main', 'main'],
symlinks: true,
modules: [
  'node_modules',
  path.join(appPath, 'node_modules')
],
  //   taroJsComponents: "@tarojs/components";
  alias: {
  // 小程序使用 regenerator-runtime@0.11
  'regenerator-runtime': require.resolve('regenerator-runtime'),
  // 开发组件库时 link 到本地调试，runtime 包需要指向本地 node_modules 顶层的 runtime，保证闭包值 Current 一致，shared 也一样
  '@tarojs/runtime': require.resolve('@tarojs/runtime'),
  '@tarojs/shared': require.resolve('@tarojs/shared')
}
alias[taroJsComponents + '$'] = taroComponentsPath || `${taroJsComponents}/mini`
env.FRAMEWORK = JSON.stringify(framework)
env.TARO_ENV = JSON.stringify(buildAdapter)
const runtimeConstants = getRuntimeConstants(runtime)
const constantsReplaceList = mergeOption([processEnvOption(env), defineConstants, runtimeConstants])
getDefinePlugin([constantsReplaceList])
/** 需要在miniPlugin前，否则无法获取entry地址 */
if (optimizeMainPackage.enable) {
  plugin.miniSplitChunksPlugin = getMiniSplitChunksPlugin({
    exclude: optimizeMainPackage.exclude
  })
}
plugin.providerPlugin = getProviderPlugin({
  window: ['@tarojs/runtime', 'window'],
  document: ['@tarojs/runtime', 'document'],
  navigator: ['@tarojs/runtime', 'navigator'],
  requestAnimationFrame: ['@tarojs/runtime', 'requestAnimationFrame'],
  cancelAnimationFrame: ['@tarojs/runtime', 'cancelAnimationFrame'],
  Element: ['@tarojs/runtime', 'TaroElement'],
  SVGElement: ['@tarojs/runtime', 'TaroElement']
})
target: createTarget({
  framework
}),
export const createTarget = function createTarget ({ framework }) {
  return (compiler: webpack.compiler.Compiler) => {
    const { options } = compiler
    new JsonpTemplatePlugin().apply(compiler)
    new FunctionModulePlugin(options.output).apply(compiler)
    new NodeSourcePlugin(options.node).apply(compiler)
    if (process.env.NODE_ENV !== 'jest') {
      // 暂时性修复 vue3 兼容问题，后续再改进写法
      if (framework === FRAMEWORK_MAP.VUE3) {
        new LoaderTargetPlugin('web').apply(compiler)
      } else {
        new LoaderTargetPlugin('node').apply(compiler)
      }
    }
  }
}

// loader 特殊处理
const baseSassOptions = {
  sourceMap: true,
  implementation: sass,
  sassOptions: {
    outputStyle: 'expanded',
    fiber: false,
    importer (url, prev, done) {
      // 让 sass 文件里的 @import 能解析小程序原生样式文体，如 @import "a.wxss";
      const extname = path.extname(url)
      // fix: @import 文件可以不带scss/sass缀，如: @import "define";
      if (extname === '.scss' || extname === '.sass' || extname === '.css' || !extname) {
        return null
      } else {
        const filePath = path.resolve(path.dirname(prev), url)
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            console.log(err)
            return null
          } else {
            fs.readFile(filePath)
              .then(res => {
                done({ contents: res.toString() })
              })
              .catch(err => {
                console.log(err)
                return null
              })
          }
        })
      }
    }
  }
}

const scriptRule: IRule = {
  test: REG_SCRIPTS,
  use: {
    babelLoader: {
      loader: require.resolve('babel-loader')
    }
  }
}

if (compile.exclude && compile.exclude.length) {
  scriptRule.exclude = [
    ...compile.exclude,
    filename => /node_modules/.test(filename) && !(/taro/.test(filename))
  ]
} else if (compile.include && compile.include.length) {
  scriptRule.include = [
    ...compile.include,
    sourceDir,
    filename => /taro/.test(filename)
  ]
} else {
  scriptRule.exclude = [filename => /node_modules/.test(filename) && !(/taro/.test(filename))]
}

template: {
  test: REG_TEMPLATE,
    use: [getFileLoader([{
    useRelativePath: true,
    name: `[path][name]${fileType.templ}`,
    context: sourceDir
  }]), miniTemplateLoader]
},
media: {
  test: REG_MEDIA,
    use: {
    urlLoader: getUrlLoader([defaultMediaUrlLoaderOption, {
      name: '[path][name].[ext]',
      useRelativePath: true,
      context: sourceDir,
      ...(postcssUrlOption || {}),
      ...mediaUrlLoaderOption
    }])
  }
},
font: {
  test: REG_FONT,
    use: {
    urlLoader: getUrlLoader([defaultFontUrlLoaderOption, {
      name: '[path][name].[ext]',
      useRelativePath: true,
      context: sourceDir,
      ...(postcssUrlOption || {}),
      ...fontUrlLoaderOption
    }])
  }
},
image: {
  test: REG_IMAGE,
    use: {
    urlLoader: getUrlLoader([defaultImageUrlLoaderOption, {
      name: '[path][name].[ext]',
      useRelativePath: true,
      context: sourceDir,
      ...(postcssUrlOption || {}),
      ...imageUrlLoaderOption
    }])
  }
}
}
```

```javascript
*
* @example
*   there's filepath 'src/index'
*   when platform is weapp, we get 'src/index.weapp.[js|ts|jsx|tsx]'
*   when platform is h5, we get 'src/index.h5.[js|ts|jsx|tsx]'
*   by default, we get 'src/index.[js|ts|jsx|tsx]'
*
* @class MultiPlatformPlugin
*/
MultiPlatformPlugin
getCopyWebpackPlugin
// Each emitted module is wrapped in a function.
// options are the output options.
// If options.pathinfo is set, each module function is annotated with a comment containing the module identifier shortened to context (absolute path).
import * as FunctionModulePlugin from 'webpack/lib/FunctionModulePlugin'
//   Chunks are wrapped into JSONP-calls. A loading algorithm is included in entry chunks. It loads chunks by adding a <script> tag.
//   options are the output options.
//   options.jsonpFunction is the JSONP function.
//   options.publicPath is uses as path for loading the chunks.
//   options.chunkFilename is the filename under that chunks are expected.
import * as JsonpTemplatePlugin from 'webpack/lib/web/JsonpTemplatePlugin'
// This module adds stuff from node.js that is not available in non-node.js environments.
// It adds polyfills for process, console, Buffer and global if used. It also binds the built in Node.js replacement modules.
import * as NodeSourcePlugin from 'webpack/lib/node/NodeSourcePlugin'
new JsonpTemplatePlugin().apply(compiler)
new FunctionModulePlugin(options.output).apply(compiler)
new NodeSourcePlugin(options.node).apply(compiler)
```

```javascript
this.ctx.modifyWebpackChain(({ chain }) => {
  // 解决微信小程序 sourcemap 映射失败的问题，#9412
  chain.output.devtoolModuleFilenameTemplate((info) => {
    const resourcePath = info.resourcePath.replace(/[/\\]/g, '_')
    return `webpack://${info.namespace}/${resourcePath}`
  })
})
```

```javascript
{
  sourceDir: '/Users/user/project/taro-app/src',
  framework: 'react',
  commonChunks: [ 'runtime', 'vendors', 'taro', 'common' ],
  isBuildQuickapp: false,
  isBuildPlugin: false,
  fileType: {
    templ: '.wxml',
    style: '.wxss',
    config: '.json',
    script: '.js',
    xs: '.wxs'
  },
  minifyXML: {},
  outputDir: '/Users/user/project/taro-app/dist',
  constantsReplaceList: {
    'process.env.NODE_ENV': '"development"',
    'process.env.FRAMEWORK': '"react"',
    'process.env.TARO_ENV': '"weapp"',
    ENABLE_INNER_HTML: true,
    ENABLE_ADJACENT_HTML: true,
    ENABLE_SIZE_APIS: false
  },
  nodeModulesPath: '/Users/user/project/taro-app/node_modules',
  template: Template {
    exportExpr: 'module.exports =',
    supportXS: true,
    Adapter: {
      if: 'wx:if',
      else: 'wx:else',
      elseif: 'wx:elif',
      for: 'wx:for',
      forItem: 'wx:for-item',
      forIndex: 'wx:for-index',
      key: 'wx:key',
      xs: 'wxs',
      type: 'weapp'
    },
    internalComponents: {
      View: [Object],
      Icon: [Object],
      Progress: [Object],
      RichText: [Object],
      Text: [Object],
      Button: [Object],
      Checkbox: [Object],
      CheckboxGroup: [Object],
      Form: [Object],
      Input: [Object],
      Label: [Object],
      Picker: [Object],
      PickerView: [Object],
      PickerViewColumn: [Object],
      Radio: [Object],
      RadioGroup: [Object],
      Slider: [Object],
      Switch: [Object],
      CoverImage: [Object],
      Textarea: [Object],
      CoverView: [Object],
      MovableArea: [Object],
      MovableView: [Object],
      ScrollView: [Object],
      Swiper: [Object],
      SwiperItem: [Object],
      Navigator: [Object],
      Audio: [Object],
      Camera: [Object],
      Image: [Object],
      LivePlayer: [Object],
      Video: [Object],
      Canvas: [Object],
      Ad: [Object],
      WebView: [Object],
      Block: {},
      Map: [Object],
      Slot: [Object],
      SlotView: [Object],
      Editor: [Object],
      MatchMedia: [Object],
      FunctionalPageNavigator: [Object],
      LivePusher: [Object],
      OfficialAccount: [Object],
      OpenData: [Object],
      NavigationBar: [Object],
      PageMeta: [Object],
      VoipRoom: [Object],
      AdCustom: [Object],
      PageContainer: [Object],
      KeyboardAccessory: {}
    },
    focusComponents: Set { 'input', 'textarea', 'editor' },
    voidElements: Set {
      'progress',
      'icon',
      'rich-text',
      'input',
      'slider',
      'switch',
      'audio',
      'ad',
      'official-account',
      'open-data',
      'navigation-bar',
      'voip-room'
    },
    nestElements: Map {
      'view' => -1,
      'catch-view' => -1,
      'cover-view' => -1,
      'static-view' => -1,
      'pure-view' => -1,
      'block' => -1,
      'text' => -1,
      'static-text' => 6,
      'slot' => 8,
      'slot-view' => 8,
      'label' => 6,
      'form' => 4,
      'scroll-view' => 4,
      'swiper' => 4,
      'swiper-item' => 4
    },
    buildPageTemplate: [Function],
    buildBaseComponentTemplate: [Function],
    buildCustomComponentTemplate: [Function],
    buildXScript: [Function],
    isSupportRecursive: false,
    _baseLevel: 16,
    buildTemplate: [Function],
    modifyTemplateResult: [Function],
    pluginOptions: {}
  },
  quickappJSON: undefined,
  designWidth: 750,
  deviceRatio: { '640': 1.17, '750': 1, '828': 0.905 },
  pluginConfig: undefined,
  pluginMainEntry: undefined,
  baseLevel: 16,
  prerender: undefined,
  addChunkPages: undefined,
  modifyMiniConfigs: [Function: modifyMiniConfigs],
  modifyBuildAssets: [Function: modifyBuildAssets],
  onCompilerMake: [Function: onCompilerMake],
  onParseCreateElement: [Function: onParseCreateElement],
  runtimePath: '@tarojs/plugin-platform-weapp/dist/runtime',
  blended: false,
  isBuildNativeComp: false,
  alias: {
    '@tarojs/components$': '@tarojs/plugin-platform-weapp/dist/components-react',
    'react-dom$': '@tarojs/react',
    'react-reconciler$': 'react-reconciler/cjs/react-reconciler.production.min.js',
    'react$': 'react/cjs/react.production.min.js',
    'scheduler$': 'scheduler/cjs/scheduler.production.min.js',
    'react/jsx-runtime$': 'react/cjs/react-jsx-runtime.production.min.js'
  }
}

```
### apply
1. getAppEntry
```javascript
compiler.options.entry = {};
return appEntryPath;
```
#### hooks.run
2. getAppConfig
```javascript
compileFile（app => runtime.js taro.js vendors.js common.js app.wxss app.js）
return appConfig;
```
3. getPages

```javascript
getTabBarFiles
getSubPackages
const pagePath = resolveMainFilePath(path.join(this.options.sourceDir, item), FRAMEWORK_EXT_MAP[framework])
this.pages = new Set([
  name: item,
  path: pagePath,
  isNative,
  stylePath: isNative ? this.getStylePath(pagePath) : undefined,
  templatePath: isNative ? this.getTemplatePath(pagePath) : undefined
])
```

```javascript
export function resolveMainFilePath (p: string, extArrs = SCRIPT_EXT): string {
  const realPath = p
  const taroEnv = process.env.TARO_ENV
  for (let i = 0; i < extArrs.length; i++) {
    const item = extArrs[i]
    if (taroEnv) {
      if (fs.existsSync(`${p}.${taroEnv}${item}`)) {
        return `${p}.${taroEnv}${item}`
      }
      if (fs.existsSync(`${p}${path.sep}index.${taroEnv}${item}`)) {
        return `${p}${path.sep}index.${taroEnv}${item}`
      }
      if (fs.existsSync(`${p.replace(/\/index$/, `.${taroEnv}/index`)}${item}`)) {
        return `${p.replace(/\/index$/, `.${taroEnv}/index`)}${item}`
      }
    }
    if (fs.existsSync(`${p}${item}`)) {
      return `${p}${item}`
    }
    if (fs.existsSync(`${p}${path.sep}index${item}`)) {
      return `${p}${path.sep}index${item}`
    }
  }
  return realPath
}
```

4. getPagesConfig
```javascript
this.pages.forEach(page => {
  this.compileFile(page)
})
```
```javascript
读取页面、组件的配置，并递归读取依赖的组件的配置
compileFile (file: IComponent) {
    const filePath = file.path
    const fileConfigPath = file.isNative ? this.replaceExt(filePath, '.json') : this.getConfigFilePath(filePath)
    const fileConfig = readConfig(fileConfigPath)
    const usingComponents = fileConfig.usingComponents

    // 递归收集依赖的第三方组件
    if (usingComponents) {
      const componentNames = Object.keys(usingComponents)
      const depComponents: Array<{ name: string, path: string }> = []
      const alias = this.options.alias
      for (const compName of componentNames) {
        let compPath = usingComponents[compName]

        if (isAliasPath(compPath, alias)) {
          compPath = replaceAliasPath(filePath, compPath, alias)
          fileConfig.usingComponents[compName] = compPath
        }

        depComponents.push({
          name: compName,
          path: compPath
        })

        if (!componentConfig.thirdPartyComponents.has(compName) && !file.isNative) {
          componentConfig.thirdPartyComponents.set(compName, new Set())
        }
      }
      depComponents.forEach(item => {
        const componentPath = resolveMainFilePath(path.resolve(path.dirname(file.path), item.path))
        if (fs.existsSync(componentPath) && !Array.from(this.components).some(item => item.path === componentPath)) {
          const componentName = this.getComponentName(componentPath)
          const componentTempPath = this.getTemplatePath(componentPath)
          const isNative = this.isNativePageORComponent(componentTempPath)
          const componentObj = {
            name: componentName,
            path: componentPath,
            isNative,
            stylePath: isNative ? this.getStylePath(componentPath) : undefined,
            templatePath: isNative ? this.getTemplatePath(componentPath) : undefined
          }
          this.components.add(componentObj)
          this.compileFile(componentObj)
        }
      })
    }
```
```javascript
readConfig=>createBabelRegister=>getModuleDefaultExport
// 关键函数
export default function createBabelRegister ({ only }) {
  require('@babel/register')({
    only: Array.from(new Set([...only])),
    presets: [
      require.resolve('@babel/preset-env'),
      require.resolve('@babel/preset-typescript')
    ],
    plugins: [
      [require.resolve('@babel/plugin-proposal-decorators'), {
        legacy: true
      }],
      require.resolve('@babel/plugin-proposal-class-properties'),
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      [require.resolve('@babel/plugin-transform-runtime'), {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: false,
        version: '^7.7.7',
        absoluteRuntime: path.resolve(__dirname, '..', 'node_modules/@babel/runtime')
      }]
    ],
    extensions: ['.js','.jsx', '.ts', '.tsx'],
    babelrc: false,
    configFile: false,
    cache: false
  })
}
```

5. getDarkMode
```javascript
const themeLocation = this.appConfig.themeLocation
const darkMode = this.appConfig.darkmode
```
6. getConfigFiles
```javascript
{
  'app.config': {
    content: { pages: [Array], debug: false, window: [Object] },
    path: '/Users/user/project/taro-app/src/app.config.ts'
  },
  'pages/index/index.config': {
    content: { navigationBarTitleText: '首页' },
    path: '/Users/user/project/taro-app/src/pages/index/index.config.ts'
  }
} 
```
```javascript
this.addEntry(filesConfig[item].path, item, helper_1.META_TYPE.CONFIG);
// webpack createChunkAssets 前一刻，去除所有 config chunks
```
7. addEntries
```javascript
this.addEntry(this.appEntry, 'app', META_TYPE.ENTRY)
this.addEntry(path.resolve(__dirname, '..', 'template/comp'), 'comp', META_TYPE.STATIC)
this.addEntry(path.resolve(__dirname, '..', 'template/custom-wrapper'), 'custom-wrapper', META_TYPE.STATIC)
this.pages.forEach(addEntry)
this.components.forEach(addEntry)
userComponents:{
  a: '@sdsad/dsad'
}
```
8. TaroLoadChunksPlugin
```javascript
传入的commonChunks: [ 'runtime', 'vendors', 'taro', 'common' ],
  /**
   * 收集 common chunks 中使用到 @tarojs/components 中的组件
   */
  commonChunks = chunks.filter(chunk => this.commonChunks.includes(chunk.name)).reverse()
// 根据miniType把commonChunks加入到文件中
if (miniType === META_TYPE.ENTRY) {
  return addRequireToSource(getIdOrName(chunk), modules, commonChunks)
}
// addChunkPages
if (fileChunks.size &&
  (miniType === META_TYPE.PAGE || miniType === META_TYPE.COMPONENT)
) {
  let source
  const id = getIdOrName(chunk)
  fileChunks.forEach((v, k) => {
    if (k === id) {
      source = addRequireToSource(id, modules, v)
    }
  })
  return source
}
```

### hooks.make
```javascript
// promises
this.compileIndependentPages(compiler, compilation, dependencies, promises)
compilation.addEntry(this.options.sourceDir, dep, dep.name, err => err ? reject(err) : resolve(null))
```

### compilation
```javascript
compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory)
compilation.dependencyFactories.set(TaroSingleEntryDependency as any, normalModuleFactory)
// module.loaders.unshift(loader)
META_TYPE.ENTRY=>@tarojs/taro-loader
META_TYPE.PAGE=>@tarojs/taro-loader
META_TYPE.COMPONENT=>@tarojs/taro-loader/lib/component
```

### afterOptimizeAssets

```javascript
new RegExp(`(\\${styleExt}|\\${templExt})\\.js(\\.map){0,1}$`).test(assetPath)
new RegExp(`${styleExt}${styleExt}$`).test(assetPath)
delete assets[assetPath]
```
  
### emit
```javascript
generateMiniFiles
// 用到wxapp template
const { 
  template, 
  modifyBuildAssets,  // 钩子函数
  modifyMiniConfigs, // 钩子函数
  isBuildPlugin, 
  sourceDir 
} = this.options
const baseTemplateName = this.getIsBuildPluginPath('base', isBuildPlugin)
const baseCompName = 'comp'
const customWrapperName = 'custom-wrapper'

// 如微信、QQ 不支持递归模版的小程序，需要使用自定义组件协助递归
this.generateTemplateFile(compilation, this.getIsBuildPluginPath(baseCompName, isBuildPlugin), template.buildBaseComponentTemplate, this.options.fileType.templ)
this.generateConfigFile(compilation, this.getIsBuildPluginPath(baseCompName, isBuildPlugin), {
  component: true,
  usingComponents: {
    [baseCompName]: `./${baseCompName}`,
    [customWrapperName]: `./${customWrapperName}`
  }
})
this.generateConfigFile(compilation, this.getIsBuildPluginPath(customWrapperName, isBuildPlugin), {
  component: true,
  usingComponents: {
    [baseCompName]: `./${baseCompName}`,
    [customWrapperName]: `./${customWrapperName}`
  }
})
this.generateTemplateFile(compilation, baseTemplateName, template.buildTemplate, componentConfig)
this.generateTemplateFile(compilation, this.getIsBuildPluginPath(customWrapperName, isBuildPlugin), template.buildCustomComponentTemplate, this.options.fileType.templ)
this.generateXSFile(compilation, 'utils', isBuildPlugin)
this.components.forEach(generateConfigFile, generateTemplateFile)
this.pages.forEach(generateConfigFile, generateTemplateFile)
this.generateTabBarFiles(compilation)
this.injectCommonStyles(compilation)
if (this.themeLocation) {
  this.generateDarkModeFile(compilation)
}
```

### afterEmit
```javascript
await this.addTarBarFilesToDependencies(compilation)=>icon

```

### new TaroNormalModulesPlugin
```javascript
if (dependency.constructor === TaroSingleEntryDependency) {
  return new TaroNormalModule(Object.assign(data, { miniType: dependency.miniType, name: dependency.name }))
  // add name, add miniType
}
// react 的第三方组件支持
// 兼容 react17 new jsx transtrom

```
### Prerender  模拟整个小程序的过程加载页面
```javascript
this.vm = new NodeVM({
  console: this.prerenderConfig.console ? 'inherit' : 'off',
  require: {
    external: true,
    context: 'sandbox'
  },
  sandbox: this.buildSandbox()
})

await this.writeScript('app')

if (!this.appLoaded) {
  try {
    this.vm.run(`
        const app = require('${this.getRealPath('app')}')
        app.onLaunch()
      `, this.outputPath)
  } catch (error) {
    printPrerenderFail('app')
    console.error(error)
  }
  this.appLoaded = true
  await Promise.resolve()
}
```
### log and callback
```javascript
bindProdLogger(compiler)
compiler.run(callback)
```
