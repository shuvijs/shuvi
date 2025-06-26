# CopyFilePlugin 文档

## 概述

`CopyFilePlugin` 是一个 Webpack 插件，用于在构建过程中将外部文件复制到构建输出目录。该插件具有缓存功能，能够提高构建性能，避免重复的文件读取和处理操作。

## 功能特性

- **文件复制**: 将指定的外部文件复制到 Webpack 构建输出中
- **智能缓存**: 使用 Webpack 的缓存系统，避免重复处理
- **内容哈希**: 为复制的文件生成基于内容的哈希值
- **自定义命名**: 支持自定义输出文件名
- **元数据支持**: 可以为复制的文件添加额外的元数据信息

## 实现原理

### 核心流程

1. **缓存检查**: 首先检查 Webpack 缓存中是否已存在该文件的处理结果
2. **文件读取**: 如果缓存未命中，则读取源文件内容
3. **哈希生成**: 使用 `loader-utils` 为文件内容生成 8 位哈希值
4. **路径生成**: 根据 Webpack 配置和哈希值生成输出文件路径
5. **资源输出**: 将文件内容作为 Webpack 资源输出
6. **缓存存储**: 将处理结果存储到缓存中

### 技术细节

```typescript
// 缓存键使用文件路径和自定义缓存键
const cachedResult = await cache.getPromise(this.filePath, this.cacheKey);

// 生成基于内容的哈希
const hash = loaderUtils.interpolateName(
  { resourcePath: '/fake/path' } as any,
  '[hash:8]',
  { content }
);

// 生成输出文件路径
const file = compilation.getAssetPath(
  compiler.options.output.filename || this.name,
  {
    contentHash: hash,
    chunk: { id: this.name, name: this.name }
  } as any
);
```

## API 接口

### 构造函数参数

```typescript
interface CopyFilePluginOptions {
  filePath: string;    // 源文件路径
  cacheKey: string;    // 缓存键，用于缓存失效控制
  name: string;        // 输出文件名
  info?: object;       // 可选的元数据信息
}
```

### 参数说明

- **filePath**: 要复制的源文件的绝对路径
- **cacheKey**: 缓存键，通常使用版本号或时间戳，用于控制缓存失效
- **name**: 输出文件的名称，如果未提供则使用 Webpack 的 output.filename 配置
- **info**: 可选的元数据对象，会传递给 `compilation.emitAsset`

## 使用方法

### 基本用法

```typescript
import { CopyFilePlugin } from '@shuvi/toolpack/lib/webpack/plugins/copy-file-plugin';

// 在 Webpack 配置中使用
webpackConfig.plugin('copy-polyfills').use(CopyFilePlugin, [
  {
    filePath: '/path/to/polyfills.js',
    cacheKey: 'v1.0.0',
    name: 'polyfills.js',
    info: {
      minimized: true,
      sourceType: 'polyfill'
    }
  }
]);
```

### 在 Shuvi 框架中的使用

在 Shuvi 框架中，`CopyFilePlugin` 主要用于复制 polyfills 文件：

```typescript
// packages/platform-web/src/node/features/html-render/index.ts
chain.plugin('polyfills').use(CopyFilePlugin, [
  {
    filePath: resolvePkgFile('polyfills/polyfills.js'),
    cacheKey: pkgVersion,
    name: BUILD_CLIENT_RUNTIME_POLYFILLS,
    info: {
      [BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL]: 1,
      // 该文件已经压缩过
      minimized: true
    }
  }
]);
```

## 实际用例

### 用例 1: 复制 Polyfills 文件

**场景**: 在客户端构建中复制浏览器兼容性 polyfills

```typescript
// 复制 core-js 和 whatwg-fetch polyfills
chain.plugin('polyfills').use(CopyFilePlugin, [
  {
    filePath: resolvePkgFile('polyfills/polyfills.js'),
    cacheKey: pkgVersion, // 使用包版本作为缓存键
    name: 'runtime-polyfills.js',
    info: {
      polyfill: true,
      minimized: true
    }
  }
]);
```

### 用例 2: 复制静态资源

**场景**: 复制配置文件或静态资源到构建输出

```typescript
// 复制配置文件
chain.plugin('copy-config').use(CopyFilePlugin, [
  {
    filePath: path.resolve(__dirname, 'config.json'),
    cacheKey: Date.now().toString(), // 使用时间戳确保最新
    name: 'app-config.json',
    info: {
      config: true
    }
  }
]);
```

### 用例 3: 复制第三方库

**场景**: 复制未通过 npm 安装的第三方库文件

```typescript
// 复制自定义库文件
chain.plugin('copy-lib').use(CopyFilePlugin, [
  {
    filePath: path.resolve(__dirname, 'libs/custom-lib.js'),
    cacheKey: 'custom-lib-v1.0.0',
    name: 'custom-lib.js',
    info: {
      library: true,
      version: '1.0.0'
    }
  }
]);
```

## 缓存机制

### 缓存策略

1. **缓存键**: 使用文件路径和自定义缓存键的组合
2. **缓存内容**: 存储文件内容和生成的输出路径
3. **缓存失效**: 通过修改 `cacheKey` 参数来触发缓存失效

### 缓存优化

```typescript
// 使用版本号作为缓存键，确保版本更新时缓存失效
const cacheKey = pkgVersion;

// 使用文件修改时间作为缓存键
const cacheKey = fs.statSync(filePath).mtime.getTime().toString();

// 使用内容哈希作为缓存键
const contentHash = require('crypto').createHash('md5').update(content).digest('hex');
const cacheKey = contentHash;
```

## 性能考虑

### 优势

- **避免重复读取**: 通过缓存避免重复的文件 I/O 操作
- **构建加速**: 在增量构建中显著提升性能
- **内存优化**: 减少重复的文件内容存储

### 注意事项

- **缓存键管理**: 需要合理设置缓存键，确保文件更新时缓存能正确失效
- **文件大小**: 对于大文件，缓存可能占用较多内存
- **并发安全**: 插件内部使用异步操作，支持并发构建

## 与其他插件的区别

### 与 copy-webpack-plugin 的区别

| 特性 | CopyFilePlugin | copy-webpack-plugin |
|------|----------------|-------------------|
| 缓存支持 | ✅ 内置缓存 | ❌ 无内置缓存 |
| 内容哈希 | ✅ 自动生成 | ❌ 需要额外配置 |
| 元数据 | ✅ 支持 | ❌ 不支持 |
| 复杂度 | 简单 | 复杂 |

### 适用场景

- **CopyFilePlugin**: 适合复制少量文件，需要缓存和自定义元数据
- **copy-webpack-plugin**: 适合批量复制大量文件，需要复杂的模式匹配

## 总结

`CopyFilePlugin` 是一个轻量级但功能强大的 Webpack 插件，特别适合在 Shuvi 框架中复制 polyfills 等运行时文件。其内置的缓存机制和内容哈希功能使其在性能和可靠性方面表现出色。

该插件的主要优势在于：
- 简单易用的 API
- 高效的缓存机制
- 灵活的文件命名
- 丰富的元数据支持

在 Shuvi 框架中，它主要用于确保客户端构建包含必要的浏览器兼容性 polyfills，为现代 Web 应用提供更好的跨浏览器支持。 