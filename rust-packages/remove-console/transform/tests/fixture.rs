// ============================================================================
// SWC 插件测试文件 - 详细解释
// ============================================================================
//
// 这个文件的作用：
// 1. 测试 remove-console 插件是否能正确移除 JavaScript 代码中的 console 语句
// 2. 使用 SWC 的测试框架自动运行多个测试用例
// 3. 确保插件在不同场景下都能正常工作
//
// 类比 JavaScript 概念：
// - 类似于 Jest + Babel 插件的测试
// - 类似于 Webpack loader 的测试
// ============================================================================

// ============================================================================
// RUST 语法部分
// ============================================================================
// 导入标准库的路径处理模块
// PathBuf 类似于 JavaScript 中的 path 模块，用于处理文件路径
// 语法: use std::path::PathBuf;  // Rust 的导入语法，类似于 JavaScript 的 import
use std::path::PathBuf;

// ============================================================================
// SWC 插件规范接口部分
// ============================================================================
// 导入 SWC 相关的模块
// SWC (Speedy Web Compiler) 是一个用 Rust 编写的快速 JavaScript/TypeScript 编译器
// 类似于 Babel，但速度更快
use swc_common::{Mark, SyntaxContext};
// 语法: use module::{Type1, Type2};  // Rust 的解构导入，类似于 JavaScript 的 import { Type1, Type2 }
// - Mark: 用于标记代码的不同阶段（类似于 Git 的 commit hash）
// - SyntaxContext: 语法上下文，用于跟踪变量作用域和引用关系

use swc_ecma_parser::{EsSyntax, Syntax};
// - EsSyntax: ES 语法配置（现代 JavaScript 语法）
// - Syntax: 语法解析器配置

use swc_ecma_transforms_base::resolver;
// resolver: 作用域解析器，类似于 JavaScript 引擎的作用域分析
// 用于确定变量、函数的作用域和引用关系

use swc_ecma_transforms_testing::{test_fixture, FixtureTestConfig};
// - test_fixture: SWC 的测试工具，类似于 Jest 的 test 函数
// - FixtureTestConfig: 测试配置选项

// ============================================================================
// 语法配置函数
// ============================================================================
// 这个函数告诉 SWC 如何解析 JavaScript 代码
// 类似于 Babel 的 presets 配置
// 语法: fn function_name() -> ReturnType { ... }  // Rust 函数定义，类似于 JavaScript 的 function
fn syntax() -> Syntax {
    // 使用 ES 语法（现代 JavaScript）
    // 类似于 Babel 的 @babel/preset-env
    // 语法: Enum::Variant(Struct { field: value, ..Default::default() })  // Rust 枚举和结构体语法
    Syntax::Es(EsSyntax {
        jsx: true, // 启用 JSX 支持（React 语法）
        // 类似于 Babel 的 @babel/preset-react

        // 语法: ..Default::default()  // Rust 的展开语法，类似于 JavaScript 的 ...defaultConfig
        // 这行代码的意思是：除了 jsx: true 之外，其他所有配置都使用默认值
        // 类似于 JavaScript 中的 { ...defaultConfig, jsx: true }
        ..Default::default()
    })
}

// ============================================================================
// 测试函数定义
// ============================================================================
// #[testing::fixture("tests/fixture/**/input.js")] 是一个 Rust 宏
// 语法: #[macro_name("pattern")]  // Rust 宏语法，类似于 JavaScript 的装饰器 @decorator
// 宏的作用类似于 JavaScript 中的装饰器或高阶函数
// 这个宏会自动：
// 1. 查找所有匹配 "tests/fixture/**/input.js" 模式的文件
// 2. 为每个文件自动生成一个测试用例
// 3. 类似于 Jest 的 describe.each() 或 glob 模式匹配

#[testing::fixture("tests/fixture/**/input.js")]
// 语法: fn function_name(parameter: Type) { ... }  // Rust 函数定义，带类型注解
fn fixture(input: PathBuf) {
    // input 参数是输入文件的路径
    // 例如：tests/fixture/basic/input.js

    // ============================================================================
    // RUST 语法部分 - 路径处理
    // ============================================================================
    // 根据输入文件路径生成输出文件路径
    // 例如：input.js -> output.js
    // 语法: let variable_name = expression;  // Rust 变量声明，类似于 JavaScript 的 const
    let output = input.parent().unwrap().join("output.js");
    // 语法链解释:
    // input.parent()     - 获取父目录，返回 Option<PathBuf> 类型
    // .unwrap()          - 处理 Option 类型，如果是 None 则 panic，类似于 JavaScript 的 ! 断言
    // .join("output.js") - 拼接路径，类似于 JavaScript 的 path.join()

    // ============================================================================
    // SWC 插件规范接口部分 - 测试框架
    // ============================================================================
    // 调用 SWC 的测试工具函数
    // test_fixture 是 SWC 提供的测试工具
    // 类似于 Jest 的 expect().toBe() 但更复杂
    test_fixture(
        syntax(), // 传入语法配置（如何解析代码）
        // ============================================================================
        // RUST 语法部分 - 闭包
        // ============================================================================
        // 转换器配置函数（闭包）
        // 这个函数定义了如何转换代码
        // 类似于 Webpack 的 loader 配置或 Babel 的 plugin 配置
        // 语法: &|parameter| { ... }  // Rust 闭包语法，类似于 JavaScript 的 (parameter) => { ... }
        &|_tr| {
            // 这是一个闭包（类似于 JavaScript 的箭头函数）
            // 语法: _parameter  // Rust 命名约定，下划线前缀表示未使用的参数
            // _tr 参数是转换器上下文，这里没有使用所以用下划线前缀
            // 下划线前缀是 Rust 的命名约定，表示未使用的变量

            // ============================================================================
            // SWC 插件规范接口部分 - 标记系统
            // ============================================================================
            // 创建标记（Mark）用于代码转换跟踪
            // Mark 类似于 Git 的 commit hash，用于标识代码的不同状态
            let unresolved_mark = Mark::new(); // 未解析阶段的标记
            let top_level_mark = Mark::new(); // 顶层作用域的标记

            // 变量命名原因：
            // - unresolved_mark: 表示代码还未解析作用域的阶段
            // - top_level_mark: 表示顶层作用域的标记
            // 这两个标记用于：
            // 1. 跟踪代码转换的不同阶段
            // 2. 区分不同的作用域
            // 3. 确保变量引用正确解析

            // ============================================================================
            // RUST 语法部分 - 元组
            // ============================================================================
            // 返回一个元组，包含两个转换器
            // 语法: (value1, value2)  // Rust 元组语法，类似于 JavaScript 的数组 [value1, value2]
            // 元组类似于 JavaScript 中的数组，但类型固定且不可变
            (
                // ============================================================================
                // SWC 插件规范接口部分 - 作用域解析器
                // ============================================================================
                // 第一个转换器：作用域解析器
                // 作用：分析变量、函数的作用域和引用关系
                // 类似于 JavaScript 引擎的作用域分析
                resolver(unresolved_mark, top_level_mark, false),
                // 参数说明：
                // - unresolved_mark: 未解析阶段的标记
                // - top_level_mark: 顶层作用域标记
                // - false: 不使用严格模式

                // ============================================================================
                // SWC 插件规范接口部分 - 自定义插件
                // ============================================================================
                // 第二个转换器：我们的 remove-console 插件
                // 这是我们要测试的主要功能
                // 语法: module::function_name(...)  // Rust 模块调用语法，类似于 JavaScript 的 module.functionName(...)
                remove_console::remove_console(
                    // 配置：移除所有的 console 调用
                    // 语法: Enum::Variant(value)  // Rust 枚举变体构造，类似于 JavaScript 的对象 { type: 'variant', value }
                    remove_console::Config::All(true),
                    // Config::All(true) 表示移除所有 console 方法
                    // 包括 console.log, console.warn, console.error 等

                    // 语法上下文：用于跟踪代码位置和作用域
                    // 语法: Type::method_name().method_chain()  // Rust 方法链调用
                    SyntaxContext::empty().apply_mark(unresolved_mark),
                    // SyntaxContext::empty() 创建空的语法上下文
                    // .apply_mark() 应用标记，用于跟踪转换过程
                ),
            )
            // 转换器链的执行顺序：
            // 1. 先执行 resolver（作用域解析）
            // 2. 再执行 remove_console（移除 console 语句）
            // 类似于 Webpack 的 loader 链：从右到左执行
        },
        // 语法: &variable  // Rust 引用语法，传递变量的引用而不是所有权
        &input,  // 输入文件路径（要转换的代码）
        &output, // 期望的输出文件路径（转换后的代码）
        // ============================================================================
        // SWC 插件规范接口部分 - 测试配置
        // ============================================================================
        // 测试配置
        // 语法: StructType { field: value, ..Default::default() }  // Rust 结构体构造语法
        FixtureTestConfig {
            // 语法: ..Default::default()  // Rust 展开语法，使用默认值填充其他字段
            ..Default::default() // 使用默认的测试配置
                                 // 类似于 JavaScript 中的 { ...defaultConfig }
        },
    );
    // test_fixture 的工作流程：
    // 1. 读取 input.js 文件
    // 2. 解析为 AST（抽象语法树）
    // 3. 应用转换器链
    // 4. 生成转换后的代码
    // 5. 与 output.js 文件比较
    // 6. 如果不同，测试失败
}

// ============================================================================
// 测试文件结构示例
// ============================================================================
// 这个测试会自动查找以下结构的文件：
//
// tests/fixture/
// ├── basic/
// │   ├── input.js    // console.log('hello');
// │   └── output.js   // (空文件，console 被移除)
// ├── jsx/
// │   ├── input.js    // console.log(<div>test</div>);
// │   └── output.js   // <div>test</div>;
// └── complex/
//     ├── input.js    // if (debug) { console.log('debug'); }
//     └── output.js   // if (debug) { }
//
// 每个 input.js 文件都会自动生成一个测试用例
// 测试会验证转换后的代码是否与对应的 output.js 文件匹配

// ============================================================================
// Rust 语法总结
// ============================================================================
//
// 基础语法:
// - use module::Type;                    // 导入，类似于 import
// - fn name() -> Type { ... }            // 函数定义，类似于 function
// - let variable = value;                // 变量声明，类似于 const
// - &|param| { ... }                     // 闭包，类似于箭头函数
// - (value1, value2)                     // 元组，类似于数组
// - #[macro(...)]                        // 宏，类似于装饰器
// - Enum::Variant(...)                   // 枚举，类似于对象
// - Struct { field: value, ..default }   // 结构体，类似于对象字面量
// - &variable                            // 引用，类似于指针
// - .unwrap()                            // 错误处理，JavaScript 没有对应
// - ..Default::default()                 // 展开语法，类似于 ...
//
// 关键概念:
// - 所有权系统: 每个值只有一个所有者
// - 借用检查: & 表示借用引用
// - Option 类型: Some(value) 或 None
// - 类型注解: 编译时类型检查
// - 宏系统: 编译时代码生成
