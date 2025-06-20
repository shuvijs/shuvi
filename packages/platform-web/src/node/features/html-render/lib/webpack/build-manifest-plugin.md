# BuildManifestPlugin

## 概述

`BuildManifestPlugin` 是一個 Webpack 插件，用於生成構建清單（build manifest）JSON 文件。該插件將入口文件名映射到實際的輸出文件名（在生產環境中可能包含哈希值），對於需要了解入口點與其對應構建資源之間關係的框架來說是必不可少的。

## 核心功能

### 🎯 主要特性
- **入口點映射**: 將入口點映射到其輸出文件
- **包文件追蹤**: 追蹤包文件及其關係
- **Polyfill 文件收集**: 識別並收集 polyfill 文件
- **可加載模塊支持**: 支持可加載模塊/塊
- **開發和生產構建**: 處理開發和生產環境的構建

### 📊 生成的清單結構

```json
{
  "entries": {
    "main": {
      "js": ["/static/js/main.abc123.js"],
      "css": ["/static/css/main.def456.css"]
    }
  },
  "bundles": {
    "main": "/static/js/main.abc123.js"
  },
  "chunkRequest": {
    "/static/js/chunk.xyz789.js": "/pages/about"
  },
  "loadble": {
    "/pages/about": {
      "files": ["/static/js/chunk.xyz789.js"],
      "children": [
        {
          "id": "module-id",
          "name": "AboutPage"
        }
      ]
    }
  },
  "polyfillFiles": ["/static/js/polyfills.ghi012.js"]
}
```

**注意**: `"loadble"` 屬性名在實際實現中故意使用此拼寫。

## 配置選項

### Options 接口

```typescript
interface Options {
  /** 構建清單 JSON 文件的輸出文件名 */
  filename: string;
  /** 是否在清單中包含模塊信息 */
  modules: boolean;
  /** 是否包含塊請求信息 */
  chunkRequest: boolean;
}
```

### 默認配置

```typescript
const defaultOptions = {
  filename: 'build-manifest.json',
  modules: false,
  chunkRequest: false
};
```

## 使用方法

### 基本用法

```typescript
// 在 webpack 配置中
const BuildManifestPlugin = require('./build-manifest-plugin');

module.exports = {
  plugins: [
    new BuildManifestPlugin({
      filename: 'build-manifest.json',
      modules: true,
      chunkRequest: true
    })
  ]
};
```

### 在 Shuvi 框架中的使用

```typescript
// 在 Shuvi 的 webpack 配置中
chain.plugin('private/build-manifest').use(BuildManifestPlugin, [
  {
    filename: CLIENT_BUILD_MANIFEST_PATH,
    modules: true,
    chunkRequest: isDev
  }
]);
```

## 核心方法

### `createAssets(compiler, compilation)`

創建構建清單的主要方法，執行以下操作：

1. **初始化清單結構**: 創建 entries、bundles、chunkRequest、loadble 對象
2. **收集入口點信息**: 處理 Entrypoint 類型的 chunk groups
3. **處理塊組和資源**: 遍歷所有 chunk groups 並收集信息
4. **識別 polyfill 文件**: 過濾並收集帶有 `BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL` 標記的文件
5. **排序和組織可加載模塊**: 確保輸出的一致性

### `apply(compiler)`

將插件應用到 Webpack 編譯器：

1. 監聽 'make' hook 以準備資產處理
2. 掛接到 'processAssets' 以生成清單文件
3. 將 JSON 文件創建為編譯資產

## 私有方法詳解

### `_collectEntries(entrypoint)`

收集入口點信息：
- 遍歷入口點的 chunks
- 過濾掉 source map 和熱更新文件
- 將文件按擴展名分類並添加到 entries 中

### `_collect(chunkGroup, compiler, compilation, chunkRootModulesMap)`

收集塊組信息：
- 處理所有 chunk groups
- 收集塊信息（文件、請求）
- 如果啟用 modules 選項，收集模塊信息
- 收集可加載模塊及其關係

### `_collectChunk(chunk, { request })`

收集個別塊信息：
- 識別包文件
- 將塊請求映射到文件
- 過濾掉 source map 和熱更新文件

### `_collectChunkModule(chunk, { request, compiler, compilation, chunkRootModulesMap })`

收集塊模塊信息（當 modules 選項啟用時）：
- 收集可加載模塊文件（JS 和 CSS）
- 收集模塊元數據（ID、名稱）
- 分析代碼分割的根模塊

### `_pushEntries(name, ext, value)`

添加入口信息到清單：
```typescript
this._pushEntries('main', 'js', '/static/js/main.abc123.js')
// 結果: { entries: { main: { js: ['/static/js/main.abc123.js'] } } }
```

### `_pushBundle({ name, file })`

添加包信息到清單：
```typescript
this._pushBundle({ name: 'main', file: '/static/js/main.abc123.js' })
// 結果: { bundles: { main: '/static/js/main.abc123.js' } }
```

### `_pushChunkRequest({ file, request })`

添加塊請求信息到清單（當 chunkRequest 選項啟用時）：
```typescript
this._pushChunkRequest({
  file: '/static/js/chunk.xyz789.js',
  request: '/pages/about'
})
// 結果: { chunkRequest: { '/static/js/chunk.xyz789.js': '/pages/about' } }
```

### `_pushLoadableModules(request, value)`

添加可加載模塊信息到清單：
```typescript
// 添加文件
this._pushLoadableModules('/pages/about', '/static/js/chunk.xyz789.js')

// 添加模塊
this._pushLoadableModules('/pages/about', {
  id: 'module-id',
  name: 'AboutPage'
})
```

## 類型定義

### IManifest 接口

```typescript
interface IManifest {
  // 僅客戶端
  polyfillFiles?: string[];
  
  entries: {
    [s: string]: IAssetMap; // name => assets
  };
  
  bundles: {
    [name: string]: string; // name => file
  };
  
  chunkRequest: {
    [file: string]: string; // file => request
  };
  
  loadble: {
    [s: string]: IModule;
  };
}
```

### IModuleItem 接口

```typescript
interface IModuleItem {
  id: string;
  name: string;
}
```

### IModule 接口

```typescript
interface IModule {
  files: string[];
  children: IModuleItem[];
}
```

### IAssetMap 類型

```typescript
type IAssetMap = {
  js: string[];
  css?: string[];
} & {
  [ext: string]: string[];
};
```

## 應用場景

### 🖥️ SSR 框架
- 將入口點映射到構建資產以進行服務器端渲染
- 確定服務器端需要加載哪些文件

### 📦 資產加載
- 確定特定路由需要加載哪些文件
- 支持按需加載和代碼分割

### 🗄️ 緩存管理
- 追蹤哈希文件名以進行緩存失效
- 支持長期緩存策略

### 🔀 代碼分割
- 理解塊與其請求之間的關係
- 優化加載性能

## 文件過濾邏輯

插件會自動過濾以下文件類型：

```typescript
// 過濾 source map 和熱更新文件
if (/\.map$/.test(file) || /\.hot-update\.js$/.test(file)) {
  continue;
}
```

## 可加載文件識別

```typescript
// 識別可加載的 JS 和 CSS 文件
const isJs = file.match(/\.js$/) && file.match(/^static\/chunks\//);
const isCss = file.match(/\.css$/) && file.match(/^static\/css\//);
```

## 去重邏輯

插件包含智能去重機制：

```typescript
// 文件去重
const existed = modules[request]!.files.some(file => file === value);
if (!existed) {
  modules[request]!.files.push(value);
}

// 模塊去重
const existed = modules[request]!.children.some(item => item.id === value.id);
if (!existed) {
  modules[request]!.children.push(value);
}
```

## 性能考慮

1. **高效查找**: 使用 Map 結構進行 chunk root modules 的快速查找
2. **條件處理**: 只在需要時收集模塊信息（modules 選項）
3. **路徑標準化**: 統一使用正斜杠，確保跨平台兼容性
4. **排序優化**: 對可加載模塊進行排序以確保一致的輸出

## 注意事項

1. **屬性名拼寫**: `"loadble"` 屬性名是故意使用此拼寫的
2. **文件路徑**: 所有文件路徑都會被標準化為使用正斜杠
3. **條件收集**: 某些信息只在特定選項啟用時才會收集
4. **類型安全**: 使用 TypeScript 確保類型安全

## 相關文件

- **Rspack 版本**: `build-manifest-plugin.rspack.ts`
- **類型定義**: `packages/platform-web/src/shared/htmlRenderer.ts`
- **常量定義**: `packages/platform-web/src/shared/constants.ts`
- **Webpack 類型**: `packages/toolpack/src/webpack/types.webpack.ts`

## 總結

`BuildManifestPlugin` 是一個功能完整、設計良好的 Webpack 插件，為現代前端框架提供了強大的資產映射功能。它不僅支持基本的入口點映射，還提供了豐富的元數據收集功能，是構建工具鏈中的重要組件。 