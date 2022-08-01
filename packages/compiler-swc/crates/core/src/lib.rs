/*
Copyright (c) 2017 The swc Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

#![recursion_limit = "2048"]
#![deny(clippy::all)]

use auto_cjs::contains_cjs;
use either::Either;
use serde::Deserialize;
use std::{sync::Arc};
use swc::config::ModuleConfig;
use swc_common::comments::Comments;
use swc_common::{self, chain};
use swc_common::{FileName, SourceFile, SourceMap};
use swc_ecmascript::ast::EsVersion;
use swc_ecmascript::parser::parse_file_as_module;
use swc_ecmascript::transforms::pass::noop;
use swc_ecmascript::visit::Fold;

mod auto_cjs;
pub mod disallow_re_export_all_in_page;
pub mod hook_optimizer;
pub mod react_remove_properties;
#[cfg(not(target_arch = "wasm32"))]
pub mod remove_console;
pub mod shake_exports;
mod top_level_binding_collector;
pub mod shuvi_dynamic;
pub mod auto_css_module;

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransformOptions {
    #[serde(flatten)]
    pub swc: swc::config::Options,

    #[serde(default)]
    pub is_page_file: bool,

    #[serde(default)]
    pub is_development: bool,

    #[serde(default)]
    pub is_server: bool,

    #[serde(default)]
    pub disable_shuvi_dynamic: bool,

    #[serde(default)]
    pub css_module_flag: String,

    #[serde(default)]
    pub styled_components: Option<styled_components::Config>,

    #[serde(default)]
    pub remove_console: Option<remove_console::Config>,

    #[serde(default)]
    pub react_remove_properties: Option<react_remove_properties::Config>,

    #[serde(default)]
    pub shake_exports: Option<shake_exports::Config>,

    #[serde(default)]
    pub emotion: Option<swc_emotion::EmotionOptions>,

    #[serde(default)]
    pub modularize_imports: Option<modularize_imports::Config>,
}

pub fn custom_before_pass<'a, C: Comments + 'a>(
    cm: Arc<SourceMap>,
    file: Arc<SourceFile>,
    opts: &'a TransformOptions,
    comments: C,
) -> impl Fold + 'a {

    chain!(
        auto_css_module::auto_css_module(opts.css_module_flag.clone()),
        disallow_re_export_all_in_page::disallow_re_export_all_in_page(opts.is_page_file),
        hook_optimizer::hook_optimizer(),
        shuvi_dynamic::shuvi_dynamic(
            opts.is_server,
            opts.disable_shuvi_dynamic
        ),

        match &opts.styled_components {
            Some(config) => Either::Left(styled_components::styled_components(
                file.name.clone(),
                file.src_hash,
                config.clone(),
            )),
            None => Either::Right(noop()),
        },
        
        match &opts.remove_console {
            Some(config) if config.truthy() =>
                Either::Left(remove_console::remove_console(config.clone())),
            _ => Either::Right(noop()),
        },
        match &opts.react_remove_properties {
            Some(config) if config.truthy() =>
                Either::Left(react_remove_properties::remove_properties(config.clone())),
            _ => Either::Right(noop()),
        },
        match &opts.shake_exports {
            Some(config) => Either::Left(shake_exports::shake_exports(config.clone())),
            None => Either::Right(noop()),
        },
        opts.emotion
            .as_ref()
            .and_then(|config| {
                if !config.enabled.unwrap_or(false) {
                    return None;
                }
                if let FileName::Real(path) = &file.name {
                    path.to_str().map(|_| {
                        Either::Left(swc_emotion::EmotionTransformer::new(
                            config.clone(),
                            path,
                            cm,
                            comments,
                        ))
                    })
                } else {
                    None
                }
            })
            .unwrap_or_else(|| Either::Right(noop())),
        match &opts.modularize_imports {
            Some(config) => Either::Left(modularize_imports::modularize_imports(config.clone())),
            None => Either::Right(noop()),
        }
    )
}

impl TransformOptions {
    pub fn patch(mut self, fm: &SourceFile) -> Self {
        self.swc.swcrc = false;

        let should_enable_commonjs = self.swc.config.module.is_none()
            && (fm.src.contains("module.exports") || fm.src.contains("__esModule"))
            && {
                let syntax = self.swc.config.jsc.syntax.unwrap_or_default();
                let target = self.swc.config.jsc.target.unwrap_or_else(EsVersion::latest);

                parse_file_as_module(fm, syntax, target, None, &mut vec![])
                    .map(|m| contains_cjs(&m))
                    .unwrap_or_default()
            };

        if should_enable_commonjs {
            self.swc.config.module = Some(ModuleConfig::CommonJs(Default::default()));
        }

        self
    }
}
