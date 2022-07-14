use swc_atoms::js_word;
use swc_common::{DUMMY_SP};
use swc_ecmascript::ast::{
  ArrayLit, ArrowExpr, BlockStmtOrExpr, CallExpr, Expr, ExprOrSpread,
  ExprOrSuper, Ident, ImportDecl, ImportSpecifier, KeyValueProp, Lit, MemberExpr, ObjectLit, Prop,
  PropName, PropOrSpread, Str, StrKind,
};
use swc_ecmascript::utils::{
  ident::{Id, IdentLike},
  HANDLER,
};
use swc_ecmascript::visit::{Fold, FoldWith};

pub fn shuvi_dynamic(dynamic: bool) -> impl Fold {
  NextDynamicPatcher {
    dynamic,
    dynamic_bindings: vec![],
    is_next_dynamic_first_arg: false,
    dynamically_imported_specifier: None,
  }
}

#[derive(Debug)]
struct NextDynamicPatcher {
  dynamic: bool,
  dynamic_bindings: Vec<Id>,
  is_next_dynamic_first_arg: bool,
  dynamically_imported_specifier: Option<String>,
}

impl Fold for NextDynamicPatcher {
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
    if self.dynamic_bindings.len() == 0 {
      return expr;
    }
    if self.is_next_dynamic_first_arg {
      if let ExprOrSuper::Expr(e) = &expr.callee {
        if let Expr::Ident(Ident { sym, .. }) = &**e {
          if sym == "import" {
            if let Expr::Lit(Lit::Str(Str { value, .. })) = &*expr.args[0].expr {
              self.dynamically_imported_specifier = Some(value.to_string());
            }
          }
        }
      }
      return expr.fold_children_with(self);
    }
    let mut expr = expr.fold_children_with(self);
    if let ExprOrSuper::Expr(i) = &expr.callee {
      if let Expr::Ident(identifier) = &**i {
        if self.dynamic_bindings.contains(&identifier.to_id()) {
          if expr.args.len() == 0 {
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
                .struct_span_err(identifier.span, "@shuvi/runtime dynamic only accepts 2 arguments")
                .emit()
            });
            return expr;
          }

          self.is_next_dynamic_first_arg = true;
          expr.args[0].expr = expr.args[0].expr.clone().fold_with(self);
          self.is_next_dynamic_first_arg = false;

          if let None = self.dynamically_imported_specifier {
            return expr;
          }

          // {
          //   webpack: () => [require.resolveWeak('../components/hello')],
          //   modules: ['../components/hello']
          // }
          let mut props = vec![
            PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
              key: PropName::Ident(Ident::new("webpack".into(), DUMMY_SP)),
              value: Box::new(Expr::Arrow(ArrowExpr {
                params: vec![],
                body: BlockStmtOrExpr::Expr(Box::new(Expr::Array(ArrayLit {
                  elems: vec![Some(ExprOrSpread {
                    expr: Box::new(Expr::Call(CallExpr {
                      callee: ExprOrSuper::Expr(Box::new(Expr::Member(MemberExpr {
                        obj: ExprOrSuper::Expr(Box::new(Expr::Ident(Ident {
                          sym: js_word!("require"),
                          span: DUMMY_SP,
                          optional: false,
                        }))),
                        prop: Box::new(Expr::Ident(Ident {
                          sym: if self.dynamic {"resolveWeak".into()} else {"resolve".into()},
                          span: DUMMY_SP,
                          optional: false,
                        })),
                        computed: false,
                        span: DUMMY_SP,
                      }))),
                      args: vec![ExprOrSpread {
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                          value: self
                            .dynamically_imported_specifier
                            .as_ref()
                            .unwrap()
                            .clone()
                            .into(),
                          span: DUMMY_SP,
                          kind: StrKind::Synthesized {},
                          has_escape: false,
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
              })),
            }))),
            PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
              key: PropName::Ident(Ident::new("modules".into(), DUMMY_SP)),
              value: Box::new(Expr::Array(ArrayLit {
                elems: vec![Some(ExprOrSpread {
                  expr: Box::new(Expr::Lit(Lit::Str(Str {
                    value: self
                      .dynamically_imported_specifier
                      .as_ref()
                      .unwrap()
                      .clone()
                      .into(),
                    span: DUMMY_SP,
                    kind: StrKind::Synthesized {},
                    has_escape: false,
                  }))),
                  spread: None,
                })],
                span: DUMMY_SP,
              })),
            }))),
          ];

          if expr.args.len() == 2 {
            if let Expr::Object(ObjectLit {
              props: options_props,
              ..
            }) = &*expr.args[1].expr
            {
              props.extend(options_props.iter().cloned());
            }
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
