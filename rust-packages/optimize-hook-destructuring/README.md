# @shuvi/optimize-hook-destructuring

SWC 插件，用于优化 React Hook 的解构模式。

## 功能

这个插件会自动检测 React Hook 函数的数组解构模式，并将其转换为对象解构模式，以提高代码的可读性和维护性。

### 转换示例

**转换前：**
```javascript
import { useState, useEffect } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // 副作用逻辑
  }, [count]);
}
```

**转换后：**
```javascript
import { useState, useEffect } from 'react';

function MyComponent() {
  const { 0: count, 1: setCount } = useState(0);
  const { 0: loading, 1: setLoading } = useState(false);
  
  useEffect(() => {
    // 副作用逻辑
  }, [count]);
}
```

## 配置

插件支持以下配置选项：

```javascript
{
  "reactPackage": "react",     // React 包名，默认为 "react"
  "hookPrefix": "use"          // Hook 函数前缀，默认为 "use"
}
```

### 配置说明

- `reactPackage`: 指定 React 包的名称，用于检测 Hook 函数的导入来源
- `hookPrefix`: 指定 Hook 函数的前缀，用于识别 Hook 函数

## 使用方法

### 在 SWC 配置中使用

```javascript
// swc.config.js
module.exports = {
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true
    },
    transform: {
      react: {
        runtime: "automatic"
      }
    },
    experimental: {
      plugins: [
        [
          "@shuvi/optimize-hook-destructuring",
          {
            reactPackage: "react",
            hookPrefix: "use"
          }
        ]
      ]
    }
  }
};
```

### 在 Shuvi 中使用

```javascript
// shuvi.config.js
module.exports = {
  swc: {
    experimental: {
      plugins: [
        [
          "@shuvi/optimize-hook-destructuring",
          {
            reactPackage: "react",
            hookPrefix: "use"
          }
        ]
      ]
    }
  }
};
```

## 工作原理

1. **Hook 检测**: 插件会扫描所有从指定 React 包导入的函数，识别以指定前缀开头的 Hook 函数
2. **模式转换**: 当检测到 Hook 函数的数组解构模式时，将其转换为对象解构模式
3. **索引映射**: 数组索引会被转换为数字属性名（如 `0`, `1`, `2` 等）

## 优势

- **提高可读性**: 对象解构模式比数组解构模式更直观
- **减少错误**: 避免因数组索引顺序错误导致的问题
- **更好的 IDE 支持**: 对象属性名提供更好的代码提示和重构支持
- **类型安全**: 在 TypeScript 中提供更好的类型推断

## 注意事项

- 插件只处理从指定 React 包导入的 Hook 函数
- 只转换数组解构模式，不影响其他解构模式
- 转换后的代码在功能上与原代码完全等价

## 开发

### 构建

```bash
cd rust-packages/optimize-hook-destructuring
cargo build --release
```

### 测试

```bash
cd rust-packages/optimize-hook-destructuring
cargo test
```

## 许可证

MIT 