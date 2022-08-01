use shuvi_swc::{
    shuvi_dynamic::shuvi_dynamic,
    react_remove_properties::remove_properties,
    remove_console::remove_console,
    auto_css_module::auto_css_module,
    shake_exports::{shake_exports, Config as ShakeExportsConfig},
};
use std::path::PathBuf;
use swc_ecma_transforms_testing::{test, test_fixture};
use swc_ecmascript::{
    parser::{EsConfig, Syntax},
};
use testing::fixture;

fn syntax() -> Syntax {
    Syntax::Es(EsConfig {
        jsx: true,
        ..Default::default()
    })
}

#[fixture("tests/fixture/shuvi-dynamic/**/input.js")]
fn shuvi_dynamic_fixture(input: PathBuf) {
    let output_client = input.parent().unwrap().join("output-client.js");
    let output_server = input.parent().unwrap().join("output-server.js");
    test_fixture(
        syntax(),
        &|_tr| {
            shuvi_dynamic(
                false,
                false,
            )
        },
        &input,
        &output_client,
    );
    test_fixture(
        syntax(),
        &|_tr| {
            shuvi_dynamic(
                true,
                false,
            )
        },
        &input,
        &output_server,
    );
}

#[fixture("tests/fixture/shuvi-dynamic-disabled/**/input.js")]
fn shuvi_dynamic_disabled_fixture(input: PathBuf) {
    let output_client = input.parent().unwrap().join("output-client.js");
    test_fixture(
        syntax(),
        &|_tr| {
            shuvi_dynamic(
                false,
                true,
            )
        },
        &input,
        &output_client,
    )
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

#[fixture("tests/fixture/remove-console/**/input.js")]
fn remove_console_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| remove_console(shuvi_swc::remove_console::Config::All(true)),
        &input,
        &output,
    );
}

#[fixture("tests/fixture/react-remove-properties/default/**/input.js")]
fn react_remove_properties_default_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| remove_properties(shuvi_swc::react_remove_properties::Config::All(true)),
        &input,
        &output,
    );
}

#[fixture("tests/fixture/react-remove-properties/custom/**/input.js")]
fn react_remove_properties_custom_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| {
            remove_properties(shuvi_swc::react_remove_properties::Config::WithOptions(
                shuvi_swc::react_remove_properties::Options {
                    properties: vec!["^data-custom$".into()],
                },
            ))
        },
        &input,
        &output,
    );
}

#[fixture("tests/fixture/shake-exports/most-usecases/input.js")]
fn shake_exports_fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| {
            shake_exports(ShakeExportsConfig {
                ignore: vec![
                    String::from("keep").into(),
                    String::from("keep1").into(),
                    String::from("keep2").into(),
                    String::from("keep3").into(),
                    String::from("keep4").into(),
                ],
            })
        },
        &input,
        &output,
    );
}

#[fixture("tests/fixture/shake-exports/keep-default/input.js")]
fn shake_exports_fixture_default(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    test_fixture(
        syntax(),
        &|_tr| {
            shake_exports(ShakeExportsConfig {
                ignore: vec![String::from("default").into()],
            })
        },
        &input,
        &output,
    );
}

