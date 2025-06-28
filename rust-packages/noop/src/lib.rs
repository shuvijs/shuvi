#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_common::SyntaxContext;
use swc_core::{
    ecma::ast::Program,
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

/// SWC 插件的主要入口函数
/// 
/// 这是一个 noop 插件，当 enable: true 时会打印信息，但不会对代码做任何修改
/// 
/// SWC 插件开发模式：
/// 1. 使用 #[plugin_transform] 宏标记插件入口函数
/// 2. 函数签名必须为: (Program, TransformPluginProgramMetadata) -> Program
/// 3. Program 是 JavaScript/TypeScript 代码的 AST 表示
/// 4. TransformPluginProgramMetadata 包含插件的配置信息和上下文
/// 5. 返回转换后的 Program AST
#[plugin_transform]
fn swc_plugin(program: Program, data: TransformPluginProgramMetadata) -> Program {
    // 从插件配置中解析配置参数
    let config = serde_json::from_str::<Option<noop_transform::Config>>(
        &data
            .get_transform_plugin_config()
            .expect("failed to get plugin config for noop"),
    )
    .expect("invalid config")
    .unwrap_or_else(|| noop_transform::Config { enable: false });

    // 应用转换逻辑到 AST
    // 这个插件实际上不会修改 AST，只是打印信息
    program.apply(noop_transform::noop_transform(
        config,
        SyntaxContext::empty().apply_mark(data.unresolved_mark),
    ))
}

/*
SWC 插件开发总结：

1. 插件结构：
   - 使用 #[plugin_transform] 宏标记入口函数
   - 函数必须接受 Program 和 TransformPluginProgramMetadata 参数
   - 返回转换后的 Program

2. 配置处理：
   - 通过 data.get_transform_plugin_config() 获取配置
   - 使用 serde_json 解析配置为 Rust 结构体
   - 提供合理的默认配置

3. AST 转换：
   - 使用 program.apply() 方法应用转换
   - 转换函数接收配置和语法上下文
   - 返回修改后的 AST

4. 语法上下文：
   - SyntaxContext 处理作用域和标识符解析
   - unresolved_mark 用于标记未解析的标识符
   - 确保转换过程中标识符的正确性

5. 错误处理：
   - 使用 expect() 处理配置解析错误
   - 提供有意义的错误信息

这个 noop 插件展示了：
- 如何创建最简单的 SWC 插件
- 如何接受配置参数
- 如何在不修改代码的情况下添加调试信息
- 插件的基本结构和模式
*/ 