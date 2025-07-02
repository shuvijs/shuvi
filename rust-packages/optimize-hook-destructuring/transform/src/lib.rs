use serde::Deserialize;
use swc_atoms::Atom;
use swc_common::{SyntaxContext, DUMMY_SP};
use swc_ecma_ast::*;
use swc_ecma_visit::{fold_pass, noop_fold_type, Fold, FoldWith};

/// 插件配置结构体
///
/// 这个结构体定义了插件可以接受的配置参数
/// 使用 serde 进行序列化/反序列化
#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    /// React 包名
    /// 默认为 "react"
    /// 用于检测 Hook 函数的导入来源
    #[serde(rename = "reactPackage")]
    pub react_package: String,
    /// Hook 函数前缀
    /// 默认为 "use"
    /// 用于识别 Hook 函数
    #[serde(rename = "hookPrefix")]
    pub hook_prefix: String,
}

/// Hook 优化转换器
///
/// 这个转换器会自动检测 React Hook 函数的数组解构模式
/// 并将其转换为中间变量赋值模式以提高代码可读性
struct HookDestructuringOptimizer {
    /// React 包名
    react_package: String,
    /// Hook 函数前缀
    hook_prefix: String,
    /// 已识别的 Hook 函数集合
    hooks: Vec<Atom>,
    /// 语法上下文（保留以备将来使用）
    _unresolved_ctxt: SyntaxContext,
    /// 当前 ref 计数器，用于生成唯一的 ref 名称
    ref_counter: usize,
}

impl HookDestructuringOptimizer {
    /// 创建新的 HookDestructuringOptimizer 实例
    fn new(config: Config, unresolved_ctxt: SyntaxContext) -> Self {
        tracing::info!(
            "🚀 Hook Destructuring Optimizer SWC plugin is enabled with config: react_package={}, hook_prefix={}",
            config.react_package,
            config.hook_prefix
        );

        Self {
            react_package: config.react_package,
            hook_prefix: config.hook_prefix,
            hooks: Vec::new(),
            _unresolved_ctxt: unresolved_ctxt,
            ref_counter: 0,
        }
    }

    /// 检查是否为 Hook 函数
    ///
    /// 检查给定的标识符是否为以指定前缀开头的 Hook 函数
    fn is_hook_function(&self, name: &Atom) -> bool {
        name.starts_with(&self.hook_prefix)
    }

    /// 检查是否为 React 导入
    ///
    /// 检查导入声明是否来自配置的 React 包
    fn is_react_import(&self, import_decl: &ImportDecl) -> bool {
        &import_decl.src.value == &self.react_package
    }

    /// 检查是否为 Hook 调用
    ///
    /// 检查函数调用是否为已识别的 Hook 函数
    fn is_hook_call(&self, call_expr: &CallExpr) -> bool {
        if let Callee::Expr(expr) = &call_expr.callee {
            if let Expr::Ident(ident) = &**expr {
                return self.hooks.contains(&ident.sym);
            }
        }
        false
    }

    /// 生成唯一的 ref 名称
    fn generate_ref_name(&mut self) -> Atom {
        if self.ref_counter == 0 {
            self.ref_counter += 1;
            Atom::from("ref")
        } else {
            let name = format!("ref{}", self.ref_counter);
            self.ref_counter += 1;
            Atom::from(name)
        }
    }

    /// 检查是否为简单的数组模式（只包含标识符）
    fn is_simple_array_pattern(&self, array_pattern: &ArrayPat) -> bool {
        for elem in &array_pattern.elems {
            if let Some(elem) = elem {
                match elem {
                    Pat::Ident(_) => continue,
                    _ => return false, // 包含其他模式，如嵌套数组或赋值模式
                }
            }
        }
        true
    }

    /// 将数组解构转换为中间变量赋值
    ///
    /// 将数组解构模式转换为中间变量赋值模式
    /// 例如: const [count, setCount] = useState(0)
    /// 转换为: var ref = useState(0), count = ref[0], setCount = ref[1]
    fn convert_array_to_ref_assignment(
        &mut self,
        array_pattern: &ArrayPat,
        init_expr: &Expr,
    ) -> Vec<VarDeclarator> {
        let mut declarators = Vec::new();

        // 生成唯一的 ref 名称
        let ref_name = self.generate_ref_name();

        // 创建中间变量 ref
        let ref_ident = Ident {
            span: DUMMY_SP,
            sym: ref_name.clone(),
            optional: false,
            ctxt: SyntaxContext::empty(),
        };

        let ref_declarator = VarDeclarator {
            name: Pat::Ident(ref_ident.into()),
            init: Some(Box::new(init_expr.clone())),
            span: DUMMY_SP,
            definite: false,
        };
        declarators.push(ref_declarator);

        // 处理数组中的每个元素
        for (i, elem) in array_pattern.elems.iter().enumerate() {
            if let Some(elem) = elem {
                if let Pat::Ident(ident) = elem {
                    let ref_ident = Ident {
                        span: DUMMY_SP,
                        sym: ref_name.clone(),
                        optional: false,
                        ctxt: SyntaxContext::empty(),
                    };

                    let member_expr = MemberExpr {
                        span: DUMMY_SP,
                        obj: Box::new(Expr::Ident(ref_ident)),
                        prop: MemberProp::Computed(ComputedPropName {
                            span: DUMMY_SP,
                            expr: Box::new(Expr::Lit(Lit::Num(Number {
                                value: i as f64,
                                span: DUMMY_SP,
                                raw: None,
                            }))),
                        }),
                    };

                    let assignment_declarator = VarDeclarator {
                        name: Pat::Ident(ident.clone()),
                        init: Some(Box::new(Expr::Member(member_expr))),
                        span: DUMMY_SP,
                        definite: false,
                    };
                    declarators.push(assignment_declarator);
                }
            }
        }

        declarators
    }

    /// 处理变量声明
    ///
    /// 检查变量声明是否为 Hook 的数组解构模式，如果是则转换为中间变量赋值
    fn process_var_declarator(&mut self, declarator: &VarDeclarator) -> Option<Vec<VarDeclarator>> {
        let VarDeclarator {
            name,
            init,
            span: _,
            definite: _,
        } = declarator;

        // 检查是否为数组模式
        if let Pat::Array(array_pattern) = name {
            // 检查是否为简单数组模式（只包含标识符和赋值模式）
            if !self.is_simple_array_pattern(array_pattern) {
                // 包含嵌套数组等复杂模式，跳过处理
                return None;
            }

            // 检查初始值是否为函数调用
            if let Some(init_expr) = init {
                if let Expr::Call(call_expr) = &**init_expr {
                    // 检查是否为 Hook 调用
                    if self.is_hook_call(call_expr) {
                        tracing::debug!("🔄 Converting hook array destructuring to ref assignment");

                        return Some(
                            self.convert_array_to_ref_assignment(array_pattern, init_expr),
                        );
                    }
                }
            }
        }

        None
    }
}

impl Fold for HookDestructuringOptimizer {
    // 告诉 SWC 这个转换器不会修改大多数节点类型
    noop_fold_type!();

    /// 折叠导入声明
    ///
    /// 收集从 React 导入的 Hook 函数
    fn fold_import_decl(&mut self, import_decl: ImportDecl) -> ImportDecl {
        // 检查是否为 React 导入
        if self.is_react_import(&import_decl) {
            // 收集 Hook 函数
            for specifier in &import_decl.specifiers {
                if let ImportSpecifier::Named(named_specifier) = specifier {
                    if self.is_hook_function(&named_specifier.local.sym) {
                        self.hooks.push(named_specifier.local.sym.clone());
                        tracing::debug!(
                            "📝 Registered hook function: {}",
                            named_specifier.local.sym
                        );
                    }
                }
            }
        }

        // 递归处理子节点
        import_decl.fold_children_with(self)
    }

    /// 折叠变量声明
    ///
    /// 处理变量声明中的 Hook 数组解构模式
    fn fold_decl(&mut self, decl: Decl) -> Decl {
        let decl = decl.fold_children_with(self);

        match decl {
            Decl::Var(var_decl) => {
                let mut new_decls = Vec::new();

                for declarator in var_decl.decls {
                    // 尝试处理变量声明
                    if let Some(transformed_decls) = self.process_var_declarator(&declarator) {
                        new_decls.extend(transformed_decls);
                    } else {
                        new_decls.push(declarator);
                    }
                }

                Decl::Var(Box::new(VarDecl {
                    decls: new_decls,
                    span: var_decl.span,
                    kind: VarDeclKind::Var, // 强制使用 var 声明
                    declare: var_decl.declare,
                    ctxt: var_decl.ctxt,
                }))
            }
            _ => decl,
        }
    }
}

/// 创建 Hook 解构优化转换器
///
/// 这是插件的主要入口函数
/// 返回一个实现了 Pass trait 的转换器
pub fn optimize_hook_destructuring_transform(
    config: Config,
    unresolved_ctxt: SyntaxContext,
) -> impl Pass {
    fold_pass(HookDestructuringOptimizer::new(config, unresolved_ctxt))
}
