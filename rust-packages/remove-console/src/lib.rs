// ============================================================================
// SWC 插件开发文件 - 详细解释
// ============================================================================
// 
// 这个文件的作用：
// 1. 定义 remove-console SWC 插件的主要逻辑
// 2. 实现 JavaScript/TypeScript 代码中 console 语句的移除功能
// 3. 提供配置驱动的转换行为
//
// 类比 JavaScript 概念：
// - 类似于 Babel 插件的入口文件
// - 类似于 Webpack loader 的主要逻辑
// - 类似于 ESLint 规则的实现
// ============================================================================

// ============================================================================
// RUST 语法部分 - 编译器指令
// ============================================================================
// #![allow(clippy::not_unsafe_ptr_arg_deref)] 是一个 Rust 编译器指令
// 语法: #![directive]  // Rust 编译器指令语法，以 #! 开头
// 作用：告诉 Rust 编译器允许特定的代码风格
// - clippy: Rust 的代码检查工具（类似于 ESLint）
// - not_unsafe_ptr_arg_deref: 允许不安全的指针解引用参数
// 这里允许是因为 SWC 插件开发中可能需要处理不安全的指针操作
//
// JavaScript 对照示例：
// // JavaScript 中没有直接对应的概念，但类似于：
// /* eslint-disable no-unsafe-optional-chaining */
// // 或者
// // @ts-ignore
#![allow(clippy::not_unsafe_ptr_arg_deref)]

// ============================================================================
// RUST 语法部分 - 模块导入
// ============================================================================
// 导入 SWC 插件开发的核心依赖
// 语法: use module::{Type1, Type2};  // Rust 的解构导入，类似于 JavaScript 的 import { Type1, Type2 }

// swc_common: SWC 的通用工具模块
use swc_common::SyntaxContext;
// - SyntaxContext: 语法上下文，用于跟踪变量作用域和引用关系
// 类似于 JavaScript 引擎中的作用域分析
//
// JavaScript 对照示例：
// import { SyntaxContext } from 'swc-common';
// // 或者
// const { SyntaxContext } = require('swc-common');

// swc_core: SWC 的核心功能模块
use swc_core::{
    // ecma::ast::Program: JavaScript/TypeScript 程序的 AST 表示
    // AST (Abstract Syntax Tree) 是代码的树状结构表示
    // 类似于 Babel 的 AST 或 ESLint 的 AST
    ecma::ast::Program,
    
    // plugin: SWC 插件系统的核心模块
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
    // - plugin_transform: 宏，用于标记插件入口函数
    // - TransformPluginProgramMetadata: 插件转换的元数据，包含配置和上下文信息
    // 类似于 Babel 插件的 visitor 或 Webpack loader 的 context
};
//
// JavaScript 对照示例：
// import { Program } from 'swc-core/ecma/ast';
// import { pluginTransform, TransformPluginProgramMetadata } from 'swc-core/plugin';
// // 或者
// const { Program } = require('swc-core/ecma/ast');
// const { pluginTransform, TransformPluginProgramMetadata } = require('swc-core/plugin');

// ============================================================================
// SWC 插件开发规范 - 主要入口函数
// ============================================================================
// 
// SWC 插件开发模式：
// 1. 使用 #[plugin_transform] 宏标记插件入口函数
// 2. 函数签名必须为: (Program, TransformPluginProgramMetadata) -> Program
// 3. Program 是 JavaScript/TypeScript 代码的 AST 表示
// 4. TransformPluginProgramMetadata 包含插件的配置信息和上下文
// 5. 返回转换后的 Program AST
//
// 类比 JavaScript 概念：
// - 类似于 Babel 插件的 visitor 函数
// - 类似于 Webpack loader 的转换函数
// - 类似于 ESLint 规则的处理器

// #[plugin_transform] 是一个 Rust 宏
// 语法: #[macro_name]  // Rust 宏语法，类似于 JavaScript 的装饰器 @decorator
// 这个宏的作用：
// 1. 标记这个函数为 SWC 插件入口
// 2. 自动处理插件的注册和调用
// 3. 确保函数签名符合 SWC 插件规范
//
// JavaScript 对照示例：
// // Babel 插件示例：
// module.exports = function({ types: t }) {
//   return {
//     visitor: {
//       CallExpression(path) {
//         // 插件逻辑
//       }
//     }
//   };
// };
//
// // Webpack loader 示例：
// module.exports = function(source) {
//   // 转换逻辑
//   return transformedSource;
// };
//
// // ESLint 规则示例：
// module.exports = {
//   create(context) {
//     return {
//       CallExpression(node) {
//         // 规则逻辑
//       }
//     };
//   }
// };
#[plugin_transform]
// 语法: fn function_name(parameter1: Type1, parameter2: Type2) -> ReturnType { ... }
// Rust 函数定义，带类型注解，类似于 TypeScript 的函数定义
fn swc_plugin(program: Program, data: TransformPluginProgramMetadata) -> Program {
    // ============================================================================
    // RUST 语法部分 - 配置解析
    // ============================================================================
    // 从插件配置中解析配置参数
    // SWC 插件可以通过配置来自定义行为
    // 类似于 Babel 插件的 options 或 Webpack loader 的配置
    
    // 语法: let variable_name = expression;  // Rust 变量声明，类似于 JavaScript 的 const
    let config = serde_json::from_str::<Option<remove_console::Config>>(
        // 语法: &expression  // Rust 引用语法，传递引用而不是所有权
        &data
            // 语法: .method_name()  // Rust 方法调用，类似于 JavaScript 的方法调用
            .get_transform_plugin_config()  // 获取插件的配置字符串
            // 语法: .expect("error message")  // Rust 错误处理，类似于 JavaScript 的 throw new Error()
            .expect("failed to get plugin config for remove-console"),
    )
    // 语法: .expect("error message")  // 处理 Result 类型，如果失败则 panic
    .expect("invalid packages")
    // 语法: .unwrap_or_else(|| default_value)  // 提供默认值，类似于 JavaScript 的 || default
    .unwrap_or_else(|| remove_console::Config::All(true));  // 默认配置：移除所有 console
    //
    // JavaScript 对照示例：
    // // 配置解析
    // const config = JSON.parse(data.getTransformPluginConfig() || '{}');
    // const defaultConfig = { removeAll: true };
    // const finalConfig = { ...defaultConfig, ...config };
    //
    // // 错误处理
    // try {
    //   const config = JSON.parse(data.getTransformPluginConfig());
    // } catch (error) {
    //   throw new Error('Failed to parse plugin config');
    // }
    //
    // // 默认值处理
    // const config = JSON.parse(data.getTransformPluginConfig()) || { removeAll: true };

    // ============================================================================
    // SWC 插件开发规范 - AST 转换
    // ============================================================================
    // 应用转换逻辑到 AST
    // 1. 使用 remove_console::remove_console 函数处理 AST
    // 2. 传入配置和语法上下文
    // 3. SyntaxContext 用于处理作用域和标识符
    // 4. data.unresolved_mark 用于标记未解析的标识符
    
    // 语法: expression.method_chain()  // Rust 方法链调用，类似于 JavaScript 的方法链
    program.apply(remove_console::remove_console(
        // 传入配置：决定哪些 console 语句需要被移除
        config,
        // 语法上下文：用于跟踪代码位置和作用域
        // 语法: Type::method_name().method_chain()  // Rust 方法链调用
        SyntaxContext::empty().apply_mark(data.unresolved_mark),
        // SyntaxContext::empty() 创建空的语法上下文
        // .apply_mark() 应用标记，用于跟踪转换过程
        // data.unresolved_mark 是 SWC 提供的未解析标记
    ))
    //
    // JavaScript 对照示例：
    // // Babel 插件示例：
    // return {
    //   ...program,
    //   body: program.body.filter(node => {
    //     // 移除 console 语句的逻辑
    //     return !isConsoleCall(node);
    //   })
    // };
    //
    // // Webpack loader 示例：
    // const transformedCode = removeConsoleStatements(source, config);
    // return transformedCode;
    //
    // // 方法链调用
    // program
    //   .apply(transformer)
    //   .apply(anotherTransformer);
}

// ============================================================================
// SWC 插件开发总结 - 详细说明
// ============================================================================
/*
SWC 插件开发总结：

1. 插件结构：
   - 使用 #[plugin_transform] 宏标记入口函数
   - 函数必须接受 Program 和 TransformPluginProgramMetadata 参数
   - 返回转换后的 Program
   - 类似于 Babel 插件的 visitor 模式

2. 配置处理：
   - 通过 data.get_transform_plugin_config() 获取配置
   - 使用 serde_json 解析配置为 Rust 结构体
   - 提供合理的默认配置
   - 类似于 Babel 插件的 options 参数

3. AST 转换：
   - 使用 program.apply() 方法应用转换
   - 转换函数接收配置和语法上下文
   - 返回修改后的 AST
   - 类似于 Babel 的 AST 遍历和修改

4. 语法上下文：
   - SyntaxContext 处理作用域和标识符解析
   - unresolved_mark 用于标记未解析的标识符
   - 确保转换过程中标识符的正确性
   - 类似于 JavaScript 引擎的作用域分析

5. 错误处理：
   - 使用 expect() 处理配置解析错误
   - 提供有意义的错误信息
   - 类似于 JavaScript 的 try-catch 或 throw

这种模式使得 SWC 插件可以：
- 高效地转换 JavaScript/TypeScript 代码
- 支持配置驱动的行为
- 保持 AST 的完整性和正确性
- 与 SWC 生态系统无缝集成
- 提供类型安全的开发体验
*/

// ============================================================================
// 具体示例对比 - Rust vs JavaScript
// ============================================================================
/*
// ============================================================================
// 1. 变量声明和类型注解
// ============================================================================

// Rust 示例：
let config: Option<Config> = Some(Config::All(true));
let name: String = "remove-console".to_string();
let count: i32 = 42;

// JavaScript 对照：
const config = { removeAll: true };
const name = "remove-console";
const count = 42;

// TypeScript 对照：
const config: Config = { removeAll: true };
const name: string = "remove-console";
const count: number = 42;

// ============================================================================
// 2. 函数定义和参数
// ============================================================================

// Rust 示例：
fn process_ast(program: Program, config: Config) -> Program {
    // 函数体
}

// JavaScript 对照：
function processAst(program, config) {
    // 函数体
}

// TypeScript 对照：
function processAst(program: Program, config: Config): Program {
    // 函数体
}

// ============================================================================
// 3. 错误处理
// ============================================================================

// Rust 示例：
let result = data.get_config().expect("Failed to get config");
let value = result.unwrap_or_else(|| default_value);

// JavaScript 对照：
const result = data.getConfig();
if (!result) {
    throw new Error("Failed to get config");
}
const value = result || defaultValue;

// TypeScript 对照：
const result = data.getConfig();
if (!result) {
    throw new Error("Failed to get config");
}
const value = result ?? defaultValue;

// ============================================================================
// 4. 方法链调用
// ============================================================================

// Rust 示例：
program
    .apply(transformer1)
    .apply(transformer2)
    .apply(transformer3);

// JavaScript 对照：
program
    .transform(transformer1)
    .transform(transformer2)
    .transform(transformer3);

// ============================================================================
// 5. 配置解析
// ============================================================================

// Rust 示例：
let config = serde_json::from_str::<Config>(&json_string)
    .expect("Invalid config")
    .unwrap_or_else(|| Config::default());

// JavaScript 对照：
const config = JSON.parse(jsonString) || {};
const finalConfig = { ...defaultConfig, ...config };

// ============================================================================
// 6. 插件结构对比
// ============================================================================

// Rust SWC 插件：
#[plugin_transform]
fn my_plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = parse_config(&metadata);
    program.apply(my_transformer(config))
}

// JavaScript Babel 插件：
module.exports = function({ types: t }) {
    return {
        visitor: {
            CallExpression(path, state) {
                const config = state.opts;
                // 转换逻辑
            }
        }
    };
};

// JavaScript Webpack Loader：
module.exports = function(source) {
    const config = this.query;
    return transform(source, config);
};

// ============================================================================
// 7. AST 操作对比
// ============================================================================

// Rust SWC 示例：
program.apply(remove_console::remove_console(config, context))

// JavaScript Babel 示例：
path.traverse({
    CallExpression(callPath) {
        if (isConsoleCall(callPath.node)) {
            callPath.remove();
        }
    }
});

// ============================================================================
// 8. 类型系统对比
// ============================================================================

// Rust 类型系统：
enum Config {
    All(bool),
    Specific(Vec<String>),
    None,
}

struct PluginMetadata {
    config: String,
    unresolved_mark: Mark,
}

// TypeScript 类型系统：
type Config = 
    | { type: 'all'; value: boolean }
    | { type: 'specific'; methods: string[] }
    | { type: 'none' };

interface PluginMetadata {
    config: string;
    unresolvedMark: number;
}
*/

// ============================================================================
// Rust 语法总结
// ============================================================================
//
// 基础语法:
// - #![directive]                      // 编译器指令，类似于 JavaScript 的 'use strict'
// - use module::{Type1, Type2};        // 导入，类似于 import { Type1, Type2 }
// - fn name(param: Type) -> Type { }   // 函数定义，类似于 function name(param: Type): Type { }
// - let variable = value;               // 变量声明，类似于 const variable = value
// - &expression                         // 引用，类似于指针
// - .method_chain()                     // 方法链，类似于 JavaScript 的方法链
// - #[macro_name]                       // 宏，类似于装饰器 @decorator
// - .expect("error")                    // 错误处理，JavaScript 没有对应
// - .unwrap_or_else(|| default)         // 默认值，类似于 || default
//
// 关键概念:
// - 所有权系统: 每个值只有一个所有者
// - 借用检查: & 表示借用引用
// - 类型注解: 编译时类型检查
// - 宏系统: 编译时代码生成
// - 错误处理: Result 和 Option 类型
// - 模块系统: 类似于 ES6 模块
//
// SWC 插件概念:
// - AST: 抽象语法树，代码的结构化表示
// - 转换器: 修改 AST 的函数
// - 配置: 插件的行为参数
// - 语法上下文: 作用域和标识符信息
// - 标记系统: 跟踪代码转换状态
