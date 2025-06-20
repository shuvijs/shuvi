# RspackBuildManifestPlugin TypeScript 錯誤修復

## 修復的問題

### 1. 導入路徑錯誤
**問題**: 使用了錯誤的導入路徑 `@shuvi/toolpack/lib/rspack`
**修復**: 改為正確的路徑 `@shuvi/toolpack/lib/webpack`

```typescript
// 修復前
import { rspack, Compiler, Compilation, sources, Plugin, ChunkGroup, Asset } from '@shuvi/toolpack/lib/rspack';

// 修復後
import { rspack, Compiler, Compilation, sources, Plugin, ChunkGroup, Asset } from '@shuvi/toolpack/lib/webpack';
```

### 2. 類型不匹配錯誤
**問題**: `compilation.getAssets()` 返回 `readonly Asset[]` 但被賦值給 `Asset[]`
**修復**: 移除顯式類型註解，讓 TypeScript 自動推斷

```typescript
// 修復前
const compilationAssets: Asset[] = compilation.getAssets();

// 修復後
const compilationAssets = compilation.getAssets();
```

### 3. 可選屬性處理
**問題**: `chunkGroupOrigin.request` 可能是 `undefined`
**修復**: 添加空值檢查和默認值

```typescript
// 修復前
const { request } = chunkGroupOrigin;
const ctx = { request, compiler, compilation };

// 修復後
const { request } = chunkGroupOrigin;
const ctx = { request: request || '', compiler, compilation };
```

### 4. 方法參數類型不匹配
**問題**: `_collectChunk` 方法期望的參數類型與實際傳入的不匹配
**修復**: 簡化參數結構，只傳遞必要的參數

```typescript
// 修復前
this._collectChunk(chunk, { request: '', compiler, compilation });

// 修復後
this._collectChunk(chunk, { request: '' });
```

### 5. 類型註解問題
**問題**: 使用 `rspack.Chunk` 類型但找不到命名空間
**修復**: 使用 `any` 類型作為臨時解決方案

```typescript
// 修復前
private _collectChunk(chunk: rspack.Chunk, ...)

// 修復後
private _collectChunk(chunk: any, ...)
```

## 添加的功能

### 1. 完整的 TSDoc 文檔
- 為所有公共方法添加了詳細的文檔
- 包含使用示例和參數說明
- 提供了完整的 API 參考

### 2. 錯誤處理
- 添加了 try-catch 塊來處理 Rspack 特定的 API 差異
- 提供了向後兼容的 fallback 機制

### 3. 測試文件
- 創建了 `test-plugin.ts` 來驗證插件的基本功能
- 包含類型檢查和方法驗證

## 兼容性說明

### Rspack vs Webpack 差異
1. **模組 API**: Rspack 的模組 API 與 webpack 不同，因此模組收集功能被簡化
2. **Chunk Graph**: Rspack 的 chunk graph API 有限制，需要額外的錯誤處理
3. **插件系統**: 雖然 API 相似，但某些內部實現可能不同

### 向後兼容性
- 保持了與原始 webpack 版本相同的公共 API
- 配置選項保持不變
- 生成的清單結構完全相同

## 使用建議

### 開發環境
```typescript
new RspackBuildManifestPlugin({
  filename: 'build-manifest.json',
  modules: false,  // 在開發環境中關閉以提升性能
  chunkRequest: true
})
```

### 生產環境
```typescript
new RspackBuildManifestPlugin({
  filename: 'build-manifest.json',
  modules: true,   // 在生產環境中啟用以獲得完整的模組信息
  chunkRequest: true
})
```

### 調試模式
如果遇到模組收集問題，可以設置：
```typescript
new RspackBuildManifestPlugin({
  modules: false,  // 暫時關閉模組收集
  chunkRequest: true
})
```

## 未來改進

1. **類型安全**: 當 Rspack 提供更好的類型定義時，可以替換 `any` 類型
2. **模組收集**: 隨著 Rspack 的發展，可以實現更完整的模組收集功能
3. **性能優化**: 利用 Rspack 的 Rust 後端進行進一步的性能優化

## 測試驗證

運行以下命令來驗證修復：
```bash
# 檢查 TypeScript 編譯
npx tsc --noEmit packages/platform-web/src/node/features/html-render/lib/rspack/build-manifest-plugin.ts

# 運行測試
node packages/platform-web/src/node/features/html-render/lib/rspack/test-plugin.ts
``` 