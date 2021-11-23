use shuvi_swc::{
    amp_attributes::amp_attributes,
    shuvi_dynamic::shuvi_dynamic,
    auto_css_module::auto_css_module
};
use std::path::PathBuf;
use swc_common::{chain, comments::SingleThreadedComments, FileName, Mark, Span, DUMMY_SP};
use swc_ecma_transforms_testing::{test, test_fixture};
use swc_ecmascript::{
    parser::{EsConfig, Syntax},
    transforms::{react::jsx, resolver},
    visit::as_folder,
};
use testing::fixture;

fn syntax() -> Syntax {
    Syntax::Es(EsConfig {
        jsx: true,
        dynamic_import: true,
        ..Default::default()
    })
}

#[fixture("tests/fixture/amp/**/input.js")]
fn amp_attributes_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(syntax(), &|_tr| amp_attributes(), &input, &output);
}
#[fixture("tests/fixture/auto-css-module/no-flag/input.js")]
fn auto_css_module_default_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| {
            auto_css_module("".into())
        },
        &input,
        &output,
    );
}

#[fixture("tests/fixture/auto-css-module/with-flag/input.js")]
fn auto_css_module_flag_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| {
            auto_css_module("foo".into())
        },
        &input,
        &output,
    );
}

#[fixture("tests/fixture/shuvi-dynamic/**/input.js")]
fn shuvi_dynamic_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| {
            shuvi_dynamic(
                FileName::Real(PathBuf::from("/some-project/src/some-file.js")),
                true
            )
        },
        &input,
        &output,
    );
}


#[fixture("tests/fixture/shuvi-dynamic-disabled/**/input.js")]
fn shuvi_dynamic_disabled_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| {
            shuvi_dynamic(
                FileName::Real(PathBuf::from("/some-project/src/some-file.js")),
                false
            )
        },
        &input,
        &output,
    );
}

pub struct DropSpan;
impl swc_ecmascript::visit::VisitMut for DropSpan {
    fn visit_mut_span(&mut self, span: &mut Span) {
        *span = DUMMY_SP
    }
}
