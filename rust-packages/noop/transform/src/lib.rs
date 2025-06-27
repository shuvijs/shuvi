use serde::Deserialize;
use swc_common::SyntaxContext;
use swc_ecma_ast::*;
use swc_ecma_visit::{fold_pass, noop_fold_type, Fold, FoldWith};

/// 插件配置结构体
/// 
/// 这个结构体定义了插件可以接受的配置参数
/// 使用 serde 进行序列化/反序列化
#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    /// 是否启用插件
    /// 当 enable: true 时，插件会打印信息
    /// 当 enable: false 时，插件完全不做任何操作
    pub enable: bool,
}

/// Noop 转换器
/// 
/// 这是一个不执行任何实际转换的转换器
/// 主要用于：
/// 1. 作为 SWC 插件的模板
/// 2. 调试和测试目的
/// 3. 学习 SWC 插件开发模式
struct NoopTransformer {
    /// 是否启用插件
    enabled: bool,
    /// 语法上下文（保留以备将来使用）
    _unresolved_ctxt: SyntaxContext,
}

impl NoopTransformer {
    /// 创建新的 NoopTransformer 实例
    fn new(config: Config, unresolved_ctxt: SyntaxContext) -> Self {
        if config.enable {
            println!("🚀 Noop SWC plugin is enabled!");
            println!("📝 This plugin will process your code but won't modify anything");
        } else {
            println!("⚠️  Noop SWC plugin is disabled");
        }

        Self {
            enabled: config.enable,
            _unresolved_ctxt: unresolved_ctxt,
        }
    }

    /// 处理语句
    /// 
    /// 当插件启用时，会打印每个语句的信息
    fn process_statement(&self, stmt: &Stmt) {
        if !self.enabled {
            return;
        }

        match stmt {
            Stmt::Expr(_expr_stmt) => {
                println!("📄 Processing expression statement");
            }
            Stmt::Decl(decl) => {
                match decl {
                    Decl::Var(var_decl) => {
                        println!("📄 Processing variable declaration with {} variables", var_decl.decls.len());
                    }
                    Decl::Fn(fn_decl) => {
                        println!("📄 Processing function declaration: {}", fn_decl.ident.sym);
                    }
                    Decl::Class(class_decl) => {
                        println!("📄 Processing class declaration: {}", class_decl.ident.sym);
                    }
                    Decl::TsInterface(ts_interface) => {
                        println!("📄 Processing TypeScript interface: {}", ts_interface.id.sym);
                    }
                    Decl::TsTypeAlias(ts_type_alias) => {
                        println!("📄 Processing TypeScript type alias: {}", ts_type_alias.id.sym);
                    }
                    Decl::TsEnum(ts_enum) => {
                        println!("📄 Processing TypeScript enum: {}", ts_enum.id.sym);
                    }
                    Decl::TsModule(_ts_module) => {
                        println!("📄 Processing TypeScript module");
                    }
                    Decl::Using(_using_decl) => {
                        println!("📄 Processing using declaration");
                    }
                }
            }
            Stmt::Block(block_stmt) => {
                println!("📄 Processing block statement with {} statements", block_stmt.stmts.len());
            }
            Stmt::If(_if_stmt) => {
                println!("📄 Processing if statement");
            }
            Stmt::Switch(switch_stmt) => {
                println!("📄 Processing switch statement with {} cases", switch_stmt.cases.len());
            }
            Stmt::For(_for_stmt) => {
                println!("📄 Processing for statement");
            }
            Stmt::While(_while_stmt) => {
                println!("📄 Processing while statement");
            }
            Stmt::DoWhile(_do_while_stmt) => {
                println!("📄 Processing do-while statement");
            }
            Stmt::ForIn(_for_in_stmt) => {
                println!("📄 Processing for-in statement");
            }
            Stmt::ForOf(_for_of_stmt) => {
                println!("📄 Processing for-of statement");
            }
            Stmt::Try(_try_stmt) => {
                println!("📄 Processing try statement");
            }
            Stmt::Throw(_throw_stmt) => {
                println!("📄 Processing throw statement");
            }
            Stmt::Return(_return_stmt) => {
                println!("📄 Processing return statement");
            }
            Stmt::Break(_break_stmt) => {
                println!("📄 Processing break statement");
            }
            Stmt::Continue(_continue_stmt) => {
                println!("📄 Processing continue statement");
            }
            Stmt::Labeled(label_stmt) => {
                println!("📄 Processing labeled statement: {}", label_stmt.label.sym);
            }
            Stmt::With(_with_stmt) => {
                println!("📄 Processing with statement");
            }
            Stmt::Empty(_) => {
                println!("📄 Processing empty statement");
            }
            Stmt::Debugger(_) => {
                println!("📄 Processing debugger statement");
            }
        }
    }
}

impl Fold for NoopTransformer {
    // 告诉 SWC 这个转换器不会修改任何节点类型
    noop_fold_type!();

    /// 折叠语句
    /// 
    /// 这是主要的处理函数，会遍历所有的语句
    fn fold_stmt(&mut self, stmt: Stmt) -> Stmt {
        // 处理当前语句
        self.process_statement(&stmt);

        // 递归处理子语句
        stmt.fold_children_with(self)
    }

    /// 折叠表达式
    /// 
    /// 当插件启用时，会打印表达式信息
    fn fold_expr(&mut self, expr: Expr) -> Expr {
        if self.enabled {
            match &expr {
                Expr::Ident(ident) => {
                    println!("🔤 Processing identifier: {}", ident.sym);
                }
                Expr::Lit(lit) => {
                    match lit {
                        Lit::Str(str_lit) => {
                            println!("🔤 Processing string literal: {}", str_lit.value);
                        }
                        Lit::Num(num_lit) => {
                            println!("🔤 Processing number literal: {}", num_lit.value);
                        }
                        Lit::Bool(bool_lit) => {
                            println!("🔤 Processing boolean literal: {}", bool_lit.value);
                        }
                        _ => {
                            println!("🔤 Processing literal");
                        }
                    }
                }
                Expr::Call(_call_expr) => {
                    println!("🔤 Processing function call");
                }
                Expr::Member(_member_expr) => {
                    println!("🔤 Processing member expression");
                }
                _ => {
                    println!("🔤 Processing expression");
                }
            }
        }

        // 递归处理子表达式
        expr.fold_children_with(self)
    }
}

/// 创建 noop 转换器
/// 
/// 这是插件的主要入口函数
/// 返回一个实现了 Pass trait 的转换器
pub fn noop_transform(config: Config, unresolved_ctxt: SyntaxContext) -> impl Pass {
    fold_pass(NoopTransformer::new(config, unresolved_ctxt))
}

/*
这个 noop 插件展示了：

1. 配置处理：
   - 使用 serde 定义配置结构体
   - 支持简单的布尔值配置
   - 提供合理的默认值

2. AST 遍历：
   - 实现 Fold trait 来遍历 AST
   - 使用 noop_fold_type!() 宏声明不修改节点类型
   - 递归处理子节点

3. 调试信息：
   - 使用 println! 输出调试信息（确保在 rspack 中可见）
   - 根据配置决定是否输出信息
   - 提供详细的节点类型信息

4. 插件模式：
   - 不修改原始代码
   - 只添加调试和监控功能
   - 可以作为其他插件的基础模板

使用方式：
```javascript
// 在 SWC 配置中
{
  "plugins": [
    ["@shuvi/plugin-noop", { "enable": true }]
  ]
}
```
*/ 