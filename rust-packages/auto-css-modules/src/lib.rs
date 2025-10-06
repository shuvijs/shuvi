#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_common::SyntaxContext;
use swc_core::{
    ecma::ast::Program,
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

#[plugin_transform]
fn swc_plugin(program: Program, data: TransformPluginProgramMetadata) -> Program {
    let config = match data.get_transform_plugin_config() {
        Some(config_str) => {
            match serde_json::from_str::<auto_css_modules_transform::Config>(&config_str) {
                Ok(config) => config,
                Err(_e) => auto_css_modules_transform::Config {
                    css_module_flag: "cssmodules".to_string(),
                },
            }
        }
        None => {
            eprintln!("No plugin config provided, using default");
            auto_css_modules_transform::Config {
                css_module_flag: "cssmodules".to_string(),
            }
        }
    };

    // 应用转换逻辑到 AST
    program.apply(auto_css_modules_transform::auto_css_modules_transform(
        config,
        SyntaxContext::empty().apply_mark(data.unresolved_mark),
    ))
}
