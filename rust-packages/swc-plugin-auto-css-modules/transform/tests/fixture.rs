use std::path::PathBuf;

use swc_common::{Mark, SyntaxContext};
use swc_ecma_parser::{EsSyntax, Syntax};
use swc_ecma_transforms_base::resolver;
use swc_ecma_transforms_testing::{test_fixture, FixtureTestConfig};
use auto_css_modules_transform::{auto_css_modules_transform, Config};

fn syntax() -> Syntax {
    Syntax::Es(EsSyntax {
        jsx: true,
        ..Default::default()
    })
}

#[testing::fixture("../../../packages/compiler/src/swc/__tests__/plugins/fixtures/auto-css-modules/**/input.ts")]
fn fixture(input: PathBuf) {
    let output = input.parent().unwrap().join("output.js");
    let options_path = input.parent().unwrap().join("options.json");
    
    // Read configuration from options.json if it exists, otherwise use default
    let config = if options_path.exists() {
        let options_content = std::fs::read_to_string(&options_path).unwrap();
        serde_json::from_str::<Config>(&options_content).unwrap()
    } else {
        Config {
            css_module_flag: "cssmodules".to_string(),
        }
    };

    test_fixture(
        syntax(),
        &|_tr| {
            let unresolved_mark = Mark::new();
            let top_level_mark = Mark::new();

            (
                resolver(unresolved_mark, top_level_mark, false),
                auto_css_modules_transform(
                    config.clone(),
                    SyntaxContext::empty().apply_mark(unresolved_mark),
                ),
            )
        },
        &input,
        &output,
        FixtureTestConfig {
            ..Default::default()
        },
    );
} 