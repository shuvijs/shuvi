use swc_atoms::js_word;
use swc_common::errors::HANDLER;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::{
    ArrayLit, ArrowExpr, BlockStmtOrExpr, Bool, CallExpr, Callee, Expr, ExprOrSpread, Id, Ident,
    ImportDecl, ImportSpecifier, KeyValueProp, Lit, MemberExpr, MemberProp, Null, ObjectLit, Prop,
    PropName, PropOrSpread, Str,
};
use swc_ecmascript::utils::ExprFactory;
use swc_ecmascript::visit::{Fold, FoldWith};

pub fn shuvi_dynamic(is_server: bool, disable_shuvi_dynamic: bool) -> impl Fold {
    ShuviDynamicPatcher {
        is_server,
        disable_shuvi_dynamic,
        dynamic_bindings: vec![],
        is_shuvi_dynamic_first_arg: false,
        dynamically_imported_specifier: None,
    }
}

#[derive(Debug)]
struct ShuviDynamicPatcher {
    is_server: bool,
    disable_shuvi_dynamic: bool,
    dynamic_bindings: Vec<Id>,
    is_shuvi_dynamic_first_arg: bool,
    dynamically_imported_specifier: Option<String>,
}

impl Fold for ShuviDynamicPatcher {
    fn fold_import_decl(&mut self, decl: ImportDecl) -> ImportDecl {
        let ImportDecl {
            ref src,
            ref specifiers,
            ..
        } = decl;
        if &src.value == "@shuvi/runtime" {
            for specifier in specifiers {
                if let ImportSpecifier::Named(dynamic_specifier) = specifier {
                    if "dynamic" == dynamic_specifier.local.sym.to_string() {
                        self.dynamic_bindings.push(dynamic_specifier.local.to_id());
                        break;
                    }
                }
            }
        }

        decl
    }

    fn fold_call_expr(&mut self, expr: CallExpr) -> CallExpr {
        if self.is_shuvi_dynamic_first_arg {
            if let Callee::Import(..) = &expr.callee {
                if let Expr::Lit(Lit::Str(Str { value, .. })) = &*expr.args[0].expr {
                    self.dynamically_imported_specifier = Some(value.to_string());
                }
            }
            return expr.fold_children_with(self);
        }
        let mut expr = expr.fold_children_with(self);
        if let Callee::Expr(i) = &expr.callee {
            if let Expr::Ident(identifier) = &**i {
                if self.dynamic_bindings.contains(&identifier.to_id()) {
                    if expr.args.is_empty() {
                        HANDLER.with(|handler| {
                            handler
                                .struct_span_err(
                                    identifier.span,
                                    "@shuvi/runtime dynamic requires at least one argument",
                                )
                                .emit()
                        });
                        return expr;
                    } else if expr.args.len() > 2 {
                        HANDLER.with(|handler| {
                            handler
                                .struct_span_err(
                                    identifier.span,
                                    "@shuvi/runtime dynamic only accepts 2 arguments",
                                )
                                .emit()
                        });
                        return expr;
                    }
                    if expr.args.len() == 2 {
                        match &*expr.args[1].expr {
                            Expr::Object(_) => {}
                            _ => {
                                HANDLER.with(|handler| {
                                    handler
                                        .struct_span_err(
                                            identifier.span,
                                            "@shuvi/runtime dynamic options must be an object \
                                             literal",
                                        )
                                        .emit();
                                });
                                return expr;
                            }
                        }
                    }

                    self.is_shuvi_dynamic_first_arg = true;
                    expr.args[0].expr = expr.args[0].expr.clone().fold_with(self);
                    self.is_shuvi_dynamic_first_arg = false;

                    if self.dynamically_imported_specifier.is_none() {
                        return expr;
                    }

                    // server:
                    // modules: ['../components/hello']

                    // client
                    // webpack: () => [require.resolveWeak('../components/hello')],

                    let mut props =
                        vec![PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                            key: PropName::Ident(Ident::new(
                                if self.is_server {
                                    "modules".into()
                                } else {
                                    "webpack".into()
                                },
                                DUMMY_SP,
                            )),
                            value: if self.is_server {
                                Box::new(Expr::Array(ArrayLit {
                                    elems: vec![Some(ExprOrSpread {
                                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                                            value: self
                                                .dynamically_imported_specifier
                                                .as_ref()
                                                .unwrap()
                                                .clone()
                                                .into(),
                                            span: DUMMY_SP,
                                            raw: None,
                                        }))),
                                        spread: None,
                                    })],
                                    span: DUMMY_SP,
                                }))
                            } else {
                                Box::new(Expr::Arrow(ArrowExpr {
                                    params: vec![],
                                    body: BlockStmtOrExpr::Expr(Box::new(Expr::Array(ArrayLit {
                                        elems: vec![Some(ExprOrSpread {
                                            expr: Box::new(Expr::Call(CallExpr {
                                                callee: Callee::Expr(Box::new(Expr::Member(
                                                    MemberExpr {
                                                        obj: Box::new(Expr::Ident(Ident {
                                                            sym: js_word!("require"),
                                                            span: DUMMY_SP,
                                                            optional: false,
                                                        })),
                                                        prop: MemberProp::Ident(Ident {
                                                            sym: if self.disable_shuvi_dynamic {
                                                                "resolve".into()
                                                            } else {
                                                                "resolveWeak".into()
                                                            },
                                                            span: DUMMY_SP,
                                                            optional: false,
                                                        }),
                                                        span: DUMMY_SP,
                                                    },
                                                ))),
                                                args: vec![ExprOrSpread {
                                                    expr: Box::new(Expr::Lit(Lit::Str(Str {
                                                        value: self
                                                            .dynamically_imported_specifier
                                                            .as_ref()
                                                            .unwrap()
                                                            .clone()
                                                            .into(),
                                                        span: DUMMY_SP,
                                                        raw: None,
                                                    }))),
                                                    spread: None,
                                                }],
                                                span: DUMMY_SP,
                                                type_args: None,
                                            })),
                                            spread: None,
                                        })],
                                        span: DUMMY_SP,
                                    }))),
                                    is_async: false,
                                    is_generator: false,
                                    span: DUMMY_SP,
                                    return_type: None,
                                    type_params: None,
                                }))
                            },
                        })))];

                    let mut has_ssr_false = false;
                    let mut has_suspense = false;

                    if expr.args.len() == 2 {
                        if let Expr::Object(ObjectLit {
                            props: options_props,
                            ..
                        }) = &*expr.args[1].expr
                        {
                            for prop in options_props.iter() {
                                if let Some(KeyValueProp { key, value }) = match prop {
                                    PropOrSpread::Prop(prop) => match &**prop {
                                        Prop::KeyValue(key_value_prop) => Some(key_value_prop),
                                        _ => None,
                                    },
                                    _ => None,
                                } {
                                    if let Some(Ident {
                                        sym,
                                        span: _,
                                        optional: _,
                                    }) = match key {
                                        PropName::Ident(ident) => Some(ident),
                                        _ => None,
                                    } {
                                        if sym == "ssr" {
                                            if let Some(Lit::Bool(Bool {
                                                value: false,
                                                span: _,
                                            })) = value.as_lit()
                                            {
                                                has_ssr_false = true
                                            }
                                        }
                                        if sym == "suspense" {
                                            if let Some(Lit::Bool(Bool {
                                                value: true,
                                                span: _,
                                            })) = value.as_lit()
                                            {
                                                has_suspense = true
                                            }
                                        }
                                    }
                                }
                            }
                            props.extend(options_props.iter().cloned());
                        }
                    }
                    // Don't need to strip the `loader` argument if suspense is true
                    if has_ssr_false && !has_suspense && self.is_server {
                        expr.args[0] = Lit::Null(Null { span: DUMMY_SP }).as_arg();
                    }

                    let second_arg = ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Object(ObjectLit {
                            span: DUMMY_SP,
                            props,
                        })),
                    };

                    if expr.args.len() == 2 {
                        expr.args[1] = second_arg;
                    } else {
                        expr.args.push(second_arg)
                    }
                    self.dynamically_imported_specifier = None;
                }
            }
        }
        expr
    }
}
