use swc_common::Mark;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
use swc_ecmascript::transforms::optimization::simplify::dce::{dce, Config as DCEConfig};
use swc_ecmascript::visit::{Fold, FoldWith};

use super::shake_exports::ExportShaker;
use swc_atoms::JsWord;

pub fn page_loader() -> impl Fold {
    PageLoader {
        shake_exports: ExportShaker {
            ignore: Vec::from([JsWord::from("loader")]),
            ..Default::default()
        },
    }
}

#[derive(Debug, Default)]
struct PageLoader {
    shake_exports: ExportShaker,
}

impl Fold for PageLoader {
    fn fold_module(&mut self, module: Module) -> Module {
        let module = module.fold_children_with(self);
        module.fold_with(&mut dce(DCEConfig::default(), Mark::new()))
    }

    fn fold_module_items(&mut self, items: Vec<ModuleItem>) -> Vec<ModuleItem> {
        
        let mut new_items = self.shake_exports.fold_module_items(items);

        let mut no_export = true;

        for item in &new_items {
            if let ModuleItem::ModuleDecl(module_decl) = item {
                match module_decl {
                    ModuleDecl::ExportDecl(_export_decl) => {
                        no_export = false;
                        break;
                    }
                    ModuleDecl::ExportNamed(_export_named) => {
                        no_export = false;
                        break;
                    }
                    _ => {}
                }
            }
        }

        if no_export {
            for ignore_item in &self.shake_exports.ignore {
                let var = VarDeclarator {
                    span: DUMMY_SP,
                    name: Pat::Ident(Ident::new(ignore_item.into(), DUMMY_SP).into()),
                    init: Some(Box::new(Expr::Lit(Lit::Bool(Bool {
                        span: DUMMY_SP,
                        value: false,
                    })))),
                    definite: Default::default(),
                };

                new_items.push(ModuleItem::ModuleDecl(ModuleDecl::ExportDecl(ExportDecl {
                    span: DUMMY_SP,
                    decl: Decl::Var(VarDecl {
                        span: DUMMY_SP,
                        kind: VarDeclKind::Var,
                        declare: Default::default(),
                        decls: vec![var],
                    }),
                })))
            }
        }
        new_items
    }
}
