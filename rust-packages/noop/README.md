# @shuvi/plugin-noop

一个简单的 SWC 插件模板，什么都不做，只打印信息。当 `enable: true` 时会打印详细的 AST 处理信息。

## 功能特性

- 🚀 **零修改**: 不会对代码进行任何修改
- 📝 **详细日志**: 当启用时，会打印每个 AST 节点的处理信息
- ⚙️ **配置驱动**: 通过 `enable` 参数控制是否输出日志
- 🎯 **学习模板**: 作为开发其他 SWC 插件的基础模板

## 安装

```bash
pnpm add @shuvi/plugin-noop
```

## 使用方法

### 基本用法

```javascript
// swc.config.js
module.exports = {
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: false,
    },
    target: 'es2020',
    plugins: [
      ['@shuvi/plugin-noop', { enable: true }]
    ]
  }
};
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `enable` | `boolean` | `false` | 是否启用插件并输出日志 |

### 配置示例

```javascript
// 启用插件，输出详细日志
['@shuvi/plugin-noop', { enable: true }]

// 禁用插件，不输出任何日志
['@shuvi/plugin-noop', { enable: false }]

// 使用默认配置（禁用）
['@shuvi/plugin-noop']
```

## 输出示例

当 `enable: true` 时，插件会输出类似以下的日志：

```
🚀 Noop SWC plugin is enabled!
📝 This plugin will process your code but won't modify anything
📄 Processing variable declaration with 1 variables
📄 Processing function declaration: greet
📄 Processing class declaration: Calculator
📄 Processing TypeScript interface: User
📄 Processing TypeScript type alias: Status
📄 Processing TypeScript enum: Color
📄 Processing if statement
📄 Processing for statement
📄 Processing while statement
📄 Processing try statement
📄 Processing switch statement with 3 cases
📄 Processing block statement with 2 statements
📄 Processing debugger statement
📄 Processing empty statement
🔤 Processing identifier: message
🔤 Processing string literal: Hello, World!
🔤 Processing number literal: 0
🔤 Processing boolean literal: true
🔤 Processing function call
🔤 Processing member expression
```

## 开发

### 构建

```bash
# 开发构建
pnpm run build:debug

# 生产构建
pnpm run build
```

### 测试

```bash
# 运行测试
pnpm test
```

## 项目结构

```
rust-packages/noop/
├── src/
│   └── lib.rs              # 主插件入口
├── transform/
│   ├── Cargo.toml          # 转换模块配置
│   └── src/
│       └── lib.rs          # 转换逻辑实现
├── __test__/
│   ├── fixtures/           # 测试文件
│   └── noop.test.ts        # 测试用例
├── Cargo.toml              # 插件配置
├── package.json            # NPM 包配置
└── README.md               # 说明文档
```

## 技术细节

### SWC 插件架构

这个插件遵循标准的 SWC 插件架构：

1. **主入口** (`src/lib.rs`): 使用 `#[plugin_transform]` 宏标记插件入口
2. **转换模块** (`transform/src/lib.rs`): 实现具体的 AST 转换逻辑
3. **配置处理**: 使用 `serde` 进行配置序列化/反序列化
4. **AST 遍历**: 实现 `Fold` trait 来遍历和观察 AST 节点

### 核心组件

- **Config**: 插件配置结构体，支持 `enable` 参数
- **NoopTransformer**: 主要的转换器，实现 AST 遍历和日志输出
- **noop_transform**: 工厂函数，创建转换器实例

### 依赖关系

- `swc_core`: SWC 核心功能
- `swc_ecma_ast`: ECMAScript AST 定义
- `swc_ecma_visit`: AST 遍历工具
- `serde`: 配置序列化
- `tracing`: 日志输出

## 学习用途

这个插件是学习 SWC 插件开发的绝佳模板：

1. **基础结构**: 展示了完整的插件项目结构
2. **配置处理**: 演示如何接受和处理插件配置
3. **AST 遍历**: 展示如何遍历不同类型的 AST 节点
4. **日志输出**: 演示如何在插件中添加调试信息
5. **错误处理**: 展示基本的错误处理模式

## 许可证

MIT License 