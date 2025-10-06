// use optimize_hook_destructuring_transform::{optimize_hook_destructuring_transform, Config};
// use std::fs;
// use std::path::PathBuf;
// use swc_common::{Mark, SyntaxContext};
// use swc_ecma_parser::Syntax;
// use swc_ecma_transforms_base::resolver;
// use swc_ecma_transforms_testing::{test_fixture, FixtureTestConfig};

// mod helper;
// use helper::{cleanup_temp_file, read_and_create_temp_file};

// fn syntax() -> Syntax {
//     Syntax::Typescript(swc_ecma_parser::TsSyntax {
//         tsx: true,
//         ..Default::default()
//     })
// }

// /// Load configuration from options.json file or return default config
// ///
// /// # Arguments
// /// * `options_path` - Path to the options.json file
// ///
// /// # Returns
// /// Config loaded from file or default config
// fn load_config(options_path: &PathBuf) -> Config {
//     if options_path.exists() {
//         let options_content = fs::read_to_string(options_path).unwrap();
//         serde_json::from_str::<Config>(&options_content).unwrap()
//     } else {
//         Config {
//             react_package: "react".to_string(),
//             hook_prefix: "use".to_string(),
//         }
//     }
// }

// #[testing::fixture(
//     "../../../packages/compiler/src/swc/__tests__/plugins/fixtures/optimize-hook-destructuring/07-*/input.ts"
// )]
// fn fixture(input: PathBuf) {
//     let output = input.parent().unwrap().join("output.js");
//     let options_path = input.parent().unwrap().join("options.json");

//     // Load configuration using helper function
//     let config = load_config(&options_path);

//     // Create temporary files using helper functions
//     let temp_input = read_and_create_temp_file(&input, false);
//     let temp_output = read_and_create_temp_file(&output, false);

//     // Run the test fixture
//     let result = test_fixture(
//         syntax(),
//         &|_tr| {
//             let unresolved_mark = Mark::new();
//             let top_level_mark = Mark::new();

//             (
//                 resolver(unresolved_mark, top_level_mark, false),
//                 optimize_hook_destructuring_transform(
//                     config.clone(),
//                     SyntaxContext::empty().apply_mark(unresolved_mark),
//                 ),
//             )
//         },
//         temp_input.path(),
//         temp_output.path(),
//         FixtureTestConfig {
//             ..Default::default()
//         },
//     );

//     // Clean up temporary files using helper function
//     let _ = cleanup_temp_file(temp_input);
//     let _ = cleanup_temp_file(temp_output);

//     // Re-throw any test errors
//     result
// }
