// - not_unsafe_ptr_arg_deref: 允许不安全的指针解引用参数
// 这里允许是因为 SWC 插件开发中可能需要处理不安全的指针操作
#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_common::SyntaxContext;
use swc_core::{
    ecma::ast::Program,
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

#[plugin_transform]
fn swc_plugin(program: Program, data: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Option<remove_console::Config>>(
        &data
            .get_transform_plugin_config()
            .expect("failed to get plugin config for remove-console"),
    )
    .expect("invalid packages")
    .unwrap_or_else(|| remove_console::Config::All(true));

    program.apply(remove_console::remove_console(
        config,
        SyntaxContext::empty().apply_mark(data.unresolved_mark),
    ))
}
