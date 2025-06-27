use serde::Deserialize;
use swc_atoms::Atom;
use swc_common::SyntaxContext;
use swc_ecma_ast::*;
use swc_ecma_visit::{fold_pass, noop_fold_type, Fold, FoldWith};

/// 插件配置结构体
/// 
/// 这个结构体定义了插件可以接受的配置参数
/// 使用 serde 进行序列化/反序列化
#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    /// CSS 模块查询参数标志
    /// 默认为 "cssmodules"
    /// 用于标识应该启用 CSS 模块处理的导入
    #[serde(rename = "cssModuleFlag")]
    pub css_module_flag: String,
}

/// 支持的 CSS 文件扩展名
const CSS_EXTENSIONS: &[&str] = &[".css", ".less", ".scss", ".sass"];

/// Auto CSS Modules 转换器
/// 
/// 这个转换器会自动检测 CSS 文件的命名导入并添加查询参数
/// 以启用 CSS 模块处理
struct AutoCssModulesTransformer {
    /// CSS 模块查询参数标志
    css_module_flag: String,
    /// 语法上下文（保留以备将来使用）
    _unresolved_ctxt: SyntaxContext,
}

impl AutoCssModulesTransformer {
    /// 创建新的 AutoCssModulesTransformer 实例
    fn new(config: Config, unresolved_ctxt: SyntaxContext) -> Self {
        tracing::info!(
            "🚀 Auto CSS Modules SWC plugin is enabled with flag: {}",
            config.css_module_flag
        );

        Self {
            css_module_flag: config.css_module_flag,
            _unresolved_ctxt: unresolved_ctxt,
        }
    }

    /// 检查是否为 CSS 文件
    /// 
    /// 检查给定的文件路径是否具有支持的 CSS 扩展名（区分大小写）
    fn is_css_file(&self, path: &str) -> bool {
        // 移除查询参数部分
        let path_without_query = path.split('?').next().unwrap_or(path);
        CSS_EXTENSIONS.iter().any(|ext| path_without_query.ends_with(ext))
    }

    /// 为 CSS 导入添加查询参数
    /// 
    /// 将查询参数添加到 CSS 文件路径以启用 CSS 模块处理
    /// 如果已有查询参数，则追加新的参数
    fn add_css_module_flag(&self, path: &str) -> String {
        if path.contains('?') {
            // 如果已有查询参数，追加新的参数
            format!("{}&{}", path, self.css_module_flag)
        } else {
            // 如果没有查询参数，添加新的查询参数
            format!("{}?{}", path, self.css_module_flag)
        }
    }

    /// 检查是否为默认导入模式
    /// 
    /// 检查导入声明是否为 `{ default as styles }` 模式
    fn is_default_import_pattern(&self, import_decl: &ImportDecl) -> bool {
        import_decl.specifiers.len() == 1 && 
        matches!(import_decl.specifiers[0], ImportSpecifier::Named(ImportNamedSpecifier { imported: Some(_), .. }))
    }

    /// 处理导入声明
    /// 
    /// 检查导入声明是否为 CSS 文件的命名导入，如果是则添加查询参数
    fn process_import_decl(&self, import_decl: &ImportDecl) -> Option<ImportDecl> {
        // 只处理命名导入（有 specifiers 且不是空的）
        if import_decl.specifiers.is_empty() {
            return None;
        }

        // 检查是否为 CSS 文件
        if !self.is_css_file(&import_decl.src.value) {
            return None;
        }

        // 不处理默认导入模式 `{ default as styles }`
        if self.is_default_import_pattern(import_decl) {
            return None;
        }

        // 创建新的导入声明，添加查询参数
        let new_src = self.add_css_module_flag(&import_decl.src.value);
        
        // 确定原始引号样式
        let raw_value = if let Some(ref raw) = import_decl.src.raw {
            // 如果原始字符串有 raw 值，使用相同的引号样式
            if raw.starts_with('\'') {
                format!("'{}'", new_src)
            } else {
                format!("\"{}\"", new_src)
            }
        } else {
            // 如果没有 raw 值，默认使用单引号（与输入文件保持一致）
            format!("'{}'", new_src)
        };
        
        let new_src_lit = Str {
            span: import_decl.src.span,
            value: Atom::from(new_src),
            raw: Some(Atom::from(raw_value)),
        };

        tracing::debug!(
            "🔄 Transforming CSS import: {} -> {}",
            import_decl.src.value,
            new_src_lit.value
        );

        Some(ImportDecl {
            src: Box::new(new_src_lit),
            ..import_decl.clone()
        })
    }
}

impl Fold for AutoCssModulesTransformer {
    // 告诉 SWC 这个转换器不会修改大多数节点类型
    noop_fold_type!();

    /// 折叠导入声明
    /// 
    /// 这是主要的处理函数，会检查并转换 CSS 导入
    fn fold_import_decl(&mut self, import_decl: ImportDecl) -> ImportDecl {
        // 尝试处理导入声明
        if let Some(transformed_decl) = self.process_import_decl(&import_decl) {
            transformed_decl
        } else {
            // 如果没有转换，递归处理子节点
            import_decl.fold_children_with(self)
        }
    }

    /// 折叠动态导入
    /// 
    /// 处理动态导入中的 CSS 文件
    fn fold_call_expr(&mut self, call_expr: CallExpr) -> CallExpr {
        // 检查是否为动态导入
        if let Callee::Import(_) = &call_expr.callee {
            if let Some(ExprOrSpread { expr, .. }) = call_expr.args.get(0) {
                if let Expr::Lit(Lit::Str(str_lit)) = &**expr {
                    // 检查是否为 CSS 文件
                    if self.is_css_file(&str_lit.value) {
                        let new_value = self.add_css_module_flag(&str_lit.value);
                        
                        // 确定原始引号样式
                        let raw_value = if let Some(ref raw) = str_lit.raw {
                            // 如果原始字符串有 raw 值，使用相同的引号样式
                            if raw.starts_with('\'') {
                                format!("'{}'", new_value)
                            } else {
                                format!("\"{}\"", new_value)
                            }
                        } else {
                            // 如果没有 raw 值，默认使用单引号
                            format!("'{}'", new_value)
                        };
                        
                        let new_str_lit = Str {
                            span: str_lit.span,
                            value: Atom::from(new_value),
                            raw: Some(Atom::from(raw_value)),
                        };

                        tracing::debug!(
                            "🔄 Transforming dynamic CSS import: {} -> {}",
                            str_lit.value,
                            new_str_lit.value
                        );

                        return CallExpr {
                            args: vec![ExprOrSpread {
                                expr: Box::new(Expr::Lit(Lit::Str(new_str_lit))),
                                spread: None,
                            }],
                            ..call_expr
                        };
                    }
                }
            }
        }

        // 递归处理子节点
        call_expr.fold_children_with(self)
    }
}

/// 创建 auto CSS modules 转换器
/// 
/// 这是插件的主要入口函数
/// 返回一个实现了 Pass trait 的转换器
pub fn auto_css_modules_transform(config: Config, unresolved_ctxt: SyntaxContext) -> impl Pass {
    fold_pass(AutoCssModulesTransformer::new(config, unresolved_ctxt))
}

/*
这个 auto CSS modules 插件实现：

1. 配置处理：
   - 支持自定义 CSS 模块查询参数标志
   - 默认为 "cssmodules"
   - 使用 serde 进行配置序列化/反序列化

2. CSS 文件检测：
   - 支持 .css, .less, .scss, .sass 扩展名
   - 通过文件路径后缀进行检测
   - 可扩展支持更多 CSS 预处理器

3. 导入转换：
   - 只处理命名导入（有 specifiers 的导入）
   - 忽略副作用导入（没有 specifiers 的导入）
   - 为 CSS 文件路径添加查询参数

4. 动态导入支持：
   - 支持 import() 动态导入
   - 检测字符串字面量中的 CSS 文件路径
   - 同样添加查询参数

5. 调试信息：
   - 使用 tracing 输出调试信息
   - 记录转换前后的文件路径
   - 便于调试和监控

使用方式：
```javascript
// 在 SWC 配置中
{
  "plugins": [
    ["@shuvi/swc-plugin-auto-css-modules", { "cssModuleFlag": "cssmodules" }]
  ]
}
```

转换示例：
```javascript
// 输入
import styles from 'a.css';
import 'b.css'; // 副作用导入，不会被转换
import other from 'c.js'; // 非 CSS 文件，不会被转换

// 输出
import styles from 'a.css?cssmodules';
import 'b.css'; // 保持不变
import other from 'c.js'; // 保持不变
```
*/ 