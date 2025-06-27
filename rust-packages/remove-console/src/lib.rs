#![allow(clippy::not_unsafe_ptr_arg_deref)]

// SWC 插件开发的核心依赖
use swc_common::SyntaxContext;
use swc_core::{
    ecma::ast::Program,  // JavaScript/TypeScript 程序的 AST 表示
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},  // 插件转换的核心类型
};

/// SWC 插件的主要入口函数
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
    // SWC 插件可以通过配置来自定义行为
    let config = serde_json::from_str::<Option<remove_console::Config>>(
        &data
            .get_transform_plugin_config()  // 获取插件的配置字符串
            .expect("failed to get plugin config for remove-console"),
    )
    .expect("invalid packages")
    .unwrap_or_else(|| remove_console::Config::All(true));  // 默认配置：移除所有 console

    // 应用转换逻辑到 AST
    // 1. 使用 remove_console::remove_console 函数处理 AST
    // 2. 传入配置和语法上下文
    // 3. SyntaxContext 用于处理作用域和标识符
    // 4. data.unresolved_mark 用于标记未解析的标识符
    program.apply(remove_console::remove_console(
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

这种模式使得 SWC 插件可以：
- 高效地转换 JavaScript/TypeScript 代码
- 支持配置驱动的行为
- 保持 AST 的完整性和正确性
- 与 SWC 生态系统无缝集成
*/
