#![allow(clippy::not_unsafe_ptr_arg_deref)]

use disallow_re_export_all_in_page_transform::{default_enabled, default_message, Config};
use swc_core::{
    ecma::ast::Program,
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

#[plugin_transform]
fn swc_plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = metadata
        .get_transform_plugin_config()
        .and_then(|s| serde_json::from_str::<Config>(&s).ok())
        .unwrap_or_else(|| Config {
            enabled: default_enabled(),
            message: default_message(),
        });

    if !config.enabled {
        return program;
    }

    program.apply(swc_ecma_visit::fold_pass(
        disallow_re_export_all_in_page_transform::disallow_re_export_all_in_page(
            disallow_re_export_all_in_page_transform::Config {
                enabled: config.enabled,
                message: config.message,
            },
        ),
    ))
}
