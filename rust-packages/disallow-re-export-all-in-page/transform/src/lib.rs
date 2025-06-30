use serde::Deserialize;
use swc_common::errors::HANDLER;
use swc_ecma_ast::ExportAll;
use swc_ecma_visit::{noop_fold_type, Fold};

#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    /// Enable or disable the plugin
    #[serde(default = "default_enabled")]
    pub enabled: bool,
    /// 自定义错误消息
    #[serde(default = "default_message")]
    pub message: String,
}

pub fn default_enabled() -> bool {
    true
}

pub fn default_message() -> String {
    "Using `export * from '...'` in a page is disallowed. Please use `export { default } from '...'` instead.".to_string()
}

struct DisallowReExportAllInPage {
    message: String,
}

impl Fold for DisallowReExportAllInPage {
    noop_fold_type!();

    fn fold_export_all(&mut self, e: ExportAll) -> ExportAll {
        HANDLER.with(|handler| handler.struct_span_err(e.span, &self.message).emit());
        e
    }
}

pub fn disallow_re_export_all_in_page(config: Config) -> impl Fold {
    if !config.enabled {
        return DisallowReExportAllInPage {
            message: String::new(),
        };
    }

    DisallowReExportAllInPage {
        message: config.message,
    }
}
