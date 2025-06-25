# RequireCacheHotReloader 插件文档

## 📖 概述

`RequireCacheHotReloader` 是一个 Webpack 插件，通过清理 Node.js 的 `require.cache` 为服务器端文件提供热重载功能。该插件确保在开发过程中，服务器能够自动加载最新编译的代码，无需手动重启服务器。

## 🎯 主要功能

- **自动缓存清理**: 在文件输出后自动清理 `require.cache`
- **增量更新**: 只清理发生变化的文件缓存
- **内存管理**: 清理已删除文件的缓存，防止内存泄漏
- **实时更新**: 文件输出时立即清理缓存
- **Webpack 5 兼容**: 使用现代 Webpack 钩子和 API

## 🔧 工作原理

### 1. 缓存清理机制

插件使用健壮的缓存清理函数，处理真实路径和符号链接：

```typescript
function deleteCache(filePath: string) {
  try {
    delete require.cache[realpathSync(filePath)];
  } catch (e: any) {
    if (e.code !== 'ENOENT') throw e;
  } finally {
    delete require.cache[filePath];
  }
}
```

### 2. Webpack 钩子集成

插件集成三个关键的 Webpack 钩子：

- **`compilation`**: 添加运行时要求，确保服务器文件重新生成
- **`assetEmitted`**: 文件输出时立即清理缓存
- **`afterEmit`**: 清理已删除文件的缓存并更新跟踪状态

### 3. 文件跟踪

插件维护两个 Set 来跟踪文件变化：

- `previousOutputPathsWebpack5`: 上一次编译的输出文件路径
- `currentOutputPathsWebpack5`: 当前编译的输出文件路径

## 🚀 使用方式

### 基本使用

在 Shuvi 框架中，该插件已自动配置，无需手动设置。

### 手动配置（高级用法）

如果需要在自定义 Webpack 配置中使用此插件：

#### JavaScript 配置

```javascript
const RequireCacheHotReloader = require('@shuvi/toolpack/src/webpack/plugins/require-cache-hot-reloader-plugin');

module.exports = {
  // ... 你的 webpack 配置
  plugins: [
    new RequireCacheHotReloader(),
    // ... 其他插件
  ],
};
```

#### TypeScript 配置

```typescript
import RequireCacheHotReloader from '@shuvi/toolpack/src/webpack/plugins/require-cache-hot-reloader-plugin';

const config: webpack.Configuration = {
  // ... 你的 webpack 配置
  plugins: [
    new RequireCacheHotReloader(),
    // ... 其他插件
  ],
};
```

## 📋 API 参考

### 类: RequireCacheHotReloader

#### 构造函数

```typescript
new RequireCacheHotReloader()
```

创建插件的新实例。

#### 属性

- `previousOutputPathsWebpack5: Set<string>` - 上一次编译的输出路径
- `currentOutputPathsWebpack5: Set<string>` - 当前编译的输出路径

#### 方法

- `apply(compiler: Compiler): void` - 将插件应用到 webpack 编译器

## 🎯 使用场景示例

### 1. 开发服务器热重载

适用于开发环境，无需重启服务器即可看到服务器端代码变更：

```javascript
// server.js
const express = require('express');
const app = express();

app.get('/api/data', (req, res) => {
  // 这段代码会在变更时热重载
  res.json({ 
    message: 'Hello from server!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users', (req, res) => {
  // API 逻辑 - 会热重载
  const users = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' }
  ];
  res.json(users);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 2. SSR 应用程序

对于服务端渲染应用，确保服务器代码与客户端代码保持同步：

```javascript
// pages/index.js
import React from 'react';

export default function HomePage() {
  return (
    <div>
      <h1>欢迎使用 Shuvi SSR!</h1>
      <p>当前时间: {new Date().toLocaleString()}</p>
    </div>
  );
}

// 这个页面组件会在服务器端热重载
```

```javascript
// pages/about.js
export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <p>这是一个使用 Shuvi 框架构建的 SSR 应用</p>
    </div>
  );
}
```

### 3. API 路由

适用于需要在开发过程中更新的 API 路由：

```javascript
// api/users.js
export default function handler(req, res) {
  // API 逻辑 - 会热重载
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // 获取用户列表
      const users = [
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' }
      ];
      res.status(200).json(users);
      break;
      
    case 'POST':
      // 创建新用户
      const { name, email } = req.body;
      const newUser = { id: Date.now(), name, email };
      res.status(201).json(newUser);
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
```

### 4. 中间件热重载

```javascript
// middleware/auth.js
export function authMiddleware(req, res, next) {
  // 认证逻辑 - 会热重载
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  
  // 验证令牌逻辑
  try {
    // 这里可以修改验证逻辑，会立即生效
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的认证令牌' });
  }
}

function verifyToken(token) {
  // 令牌验证逻辑
  // 修改这里的逻辑会立即生效
  return { id: 1, username: 'admin' };
}
```

## ⚡ 性能考虑

### 内存管理

插件自动清理已删除文件的缓存，防止内存泄漏：

```typescript
// 自动移除不再存在于输出中的文件缓存
for (const outputPath of this.previousOutputPathsWebpack5) {
  if (!this.currentOutputPathsWebpack5.has(outputPath)) {
    deleteCache(outputPath);
  }
}
```

### 增量更新

只清理实际发生变化的文件缓存，最小化性能影响：

```typescript
// 只为新输出的文件清理缓存
compiler.hooks.assetEmitted.tap(PLUGIN_NAME, (_file, { targetPath }) => {
  this.currentOutputPathsWebpack5.add(targetPath);
  deleteCache(targetPath); // 只为这个特定文件清理缓存
});
```

## 🔧 配置选项

目前插件不接受配置选项，因为它被设计为自动工作。但你可以扩展它以获得自定义行为：

```typescript
class CustomRequireCacheHotReloader extends RequireCacheHotReloader {
  apply(compiler: Compiler) {
    // 在调用父类之前添加自定义逻辑
    console.log('自定义热重载器已应用');
    
    // 调用父类实现
    super.apply(compiler);
  }
}
```

## 🐛 故障排除

### 常见问题

1. **缓存未清理**: 确保插件已应用到正确的 webpack 配置
2. **内存泄漏**: 插件自动处理清理，但在长时间运行的进程中监控内存使用情况
3. **文件路径问题**: 插件自动处理真实路径和符号链接

### 调试模式

要调试插件行为，可以添加日志：

```typescript
// 在你的 webpack 配置中
const RequireCacheHotReloader = require('@shuvi/toolpack/src/webpack/plugins/require-cache-hot-reloader-plugin');

class DebugRequireCacheHotReloader extends RequireCacheHotReloader {
  apply(compiler: Compiler) {
    compiler.hooks.assetEmitted.tap('DebugRequireCacheHotReloader', (file, { targetPath }) => {
      console.log(`正在清理缓存: ${targetPath}`);
      deleteCache(targetPath);
    });
  }
}
```

## 📚 相关文档

- [Shuvi 框架文档](https://shuvi.js.org/)
- [Webpack 插件 API](https://webpack.js.org/api/plugins/)
- [Node.js require.cache](https://nodejs.org/api/modules.html#requirecache)

## 🤝 贡献

此插件是 Shuvi 框架的一部分。要贡献：

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 添加测试
5. 提交拉取请求

## 📄 许可证

此插件是 Shuvi 框架的一部分，遵循相同的许可证条款。 