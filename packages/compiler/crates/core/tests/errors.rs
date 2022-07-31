use shuvi_swc::{
    disallow_re_export_all_in_page::disallow_re_export_all_in_page, 
    shuvi_dynamic::shuvi_dynamic,
};
use std::path::PathBuf;
use swc_ecma_transforms_testing::test_fixture_allowing_error;
use swc_ecmascript::parser::{EsConfig, Syntax};
use testing::fixture;

fn syntax() -> Syntax {
    Syntax::Es(EsConfig {
        jsx: true,
        ..Default::default()
    })
}

#[fixture("tests/errors/re-export-all-in-page/**/input.js")]
fn re_export_all_in_page(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture_allowing_error(
        syntax(),
        &|_tr| disallow_re_export_all_in_page(true),
        &input,
        &output,
    );
}

#[fixture("tests/errors/shuvi-dynamic/**/input.js")]
fn shuvi_dynamic_errors(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture_allowing_error(
        syntax(),
        &|_tr| {
            shuvi_dynamic(
                false,
                false,
            )
        },
        &input,
        &output,
    );
}
