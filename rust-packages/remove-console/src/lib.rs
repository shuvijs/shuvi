// - not_unsafe_ptr_arg_deref: 允许不安全的指针解引用参数
// 这里允许是因为 SWC 插件开发中可能需要处理不安全的指针操作
#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_common::SyntaxContext;
// - SyntaxContext: 语法上下文，用于跟踪变量作用域和引用关系

// swc_core: SWC 的核心功能模块
use swc_core::{
    // ecma::ast::Program: JavaScript/TypeScript 程序的 AST 表示
    ecma::ast::Program,

    // plugin: SWC 插件系统的核心模块
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
    // - plugin_transform: 宏，用于标记插件入口函数
    // - TransformPluginProgramMetadata: 插件转换的元数据，包含配置和上下文信息
};

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
fn swc_plugin(program: Program, data: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Option<remove_console::Config>>(
        // 语法: &expression  // Rust 引用语法，传递引用而不是所有权
        &data
            .get_transform_plugin_config() // 获取插件的配置字符串
            // 语法: .expect("error message")  // Rust 错误处理，类似于 JavaScript 的 throw new Error()
            .expect("failed to get plugin config for remove-console"),
    )
    .expect("invalid packages")
    .unwrap_or_else(|| remove_console::Config::All(true)); // 默认配置：移除所有 console

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
}
