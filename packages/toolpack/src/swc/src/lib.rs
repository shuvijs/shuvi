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
//#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;
/// Explicit extern crate to use allocator.
extern crate swc_node_base;

use auto_cjs::contains_cjs;
use backtrace::Backtrace;
use napi::{CallContext, Env, JsObject, JsUndefined};
use serde::Deserialize;
use std::{env, panic::set_hook, sync::Arc};
use swc::{config::ModuleConfig, Compiler, TransformOutput};
use swc_common::SourceFile;
use swc_common::{self, chain, sync::Lazy, FileName, FilePathMapping, SourceMap};
use swc_ecmascript::ast::EsVersion;
use swc_ecmascript::{
    parser::{lexer::Lexer, Parser, StringInput},
    visit::Fold,
};

mod auto_cjs;
mod bundle;
pub mod hook_optimizer;
pub mod shuvi_dynamic;
pub mod auto_css_module;
// pub mod minify;
// pub mod next_ssg;
// pub mod page_config;
// pub mod styled_jsx;
mod transform;
mod util;

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransformOptions {
    #[serde(flatten)]
    pub swc: swc::config::Options,

    #[serde(default)]
    pub disable_next_ssg: bool,

    #[serde(default)]
    pub disable_shuvi_dynamic: bool,

    #[serde(default)]
    pub disable_page_config: bool,

    #[serde(default)]
    pub flag: String,

    #[serde(default)]
    pub is_page_file: bool,

    #[serde(default)]
    pub is_development: bool,
}

pub fn custom_before_pass(name: &FileName, opts: &TransformOptions) -> impl Fold {
    chain!(
        auto_css_module::auto_css_module(opts.flag.clone()),
        hook_optimizer::hook_optimizer(),
        shuvi_dynamic::shuvi_dynamic(name.clone(), !opts.disable_shuvi_dynamic.clone())
    )
}

static COMPILER: Lazy<Arc<Compiler>> = Lazy::new(|| {
    let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));

    Arc::new(Compiler::new(cm.clone()))
});

#[module_exports]
fn init(mut exports: JsObject) -> napi::Result<()> {
    if cfg!(debug_assertions) || env::var("SWC_DEBUG").unwrap_or_default() == "1" {
        set_hook(Box::new(|panic_info| {
            let backtrace = Backtrace::new();
            println!("Panic: {:?}\nBacktrace: {:?}", panic_info, backtrace);
        }));
    }

    exports.create_named_method("bundle", bundle::bundle)?;

    exports.create_named_method("transform", transform::transform)?;
    exports.create_named_method("transformSync", transform::transform_sync)?;

    Ok(())
}

fn get_compiler(_ctx: &CallContext) -> Arc<Compiler> {
    COMPILER.clone()
}

#[js_function]
fn construct_compiler(ctx: CallContext) -> napi::Result<JsUndefined> {
    // TODO: Assign swc::Compiler
    ctx.env.get_undefined()
}

pub fn complete_output(env: &Env, output: TransformOutput) -> napi::Result<JsObject> {
    env.to_js_value(&output)?.coerce_to_object()
}

impl TransformOptions {
    pub fn patch(mut self, fm: &SourceFile) -> Self {
        self.swc.swcrc = false;

        let should_enable_commonjs =
            self.swc.config.module.is_none() && fm.src.contains("module.exports") && {
                let syntax = self.swc.config.jsc.syntax.unwrap_or_default();
                let target = self.swc.config.jsc.target.unwrap_or(EsVersion::latest());
                let lexer = Lexer::new(syntax, target, StringInput::from(&*fm), None);
                let mut p = Parser::new_from(lexer);
                p.parse_module()
                    .map(|m| contains_cjs(&m))
                    .unwrap_or_default()
            };

        if should_enable_commonjs {
            self.swc.config.module = Some(ModuleConfig::CommonJs(Default::default()));
        }

        self
    }
}

pub type ArcCompiler = Arc<Compiler>;
