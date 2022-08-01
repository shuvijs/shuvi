use swc_atoms::JsWord;
use swc_ecmascript::ast::{ImportDecl, ImportSpecifier};
use swc_ecmascript::visit::Fold;

pub fn auto_css_module(flag: String) -> impl Fold {
    AutoCssModule {
        flag,
        has_specifier: false,
    }
}

#[derive(Debug)]
struct AutoCssModule {
    flag: String,
    has_specifier: bool,
}

impl Fold for AutoCssModule {
    fn fold_import_decl(&mut self, decl: ImportDecl) -> ImportDecl {
        self.has_specifier = false;
        for specifier in &decl.specifiers {
            if let ImportSpecifier::Default(default_specifier) = specifier {
                self.has_specifier = default_specifier.local.sym.len() > 0;
                break;
            }
        }
        if !self.has_specifier {
            return decl;
        }
        const CSS_EXTENSION_LIST: [&str; 4] = [".css", ".less", ".sass", ".scss"];
        for i in CSS_EXTENSION_LIST {
            if decl.src.value.contains(i) {
                let mut cloned_decl = decl.clone();

                let sign: String = if cloned_decl.src.value.contains('?') {
                    "&".to_owned()
                } else {
                    "?".to_owned()
                };
                let flag: &str = if self.flag.is_empty() || self.flag.len() == 0 {
                    "cssmodules"
                } else {
                    &self.flag
                };
                let extra = sign + flag;
                cloned_decl.src.value = JsWord::from(cloned_decl.src.value.to_string() + &extra);
                cloned_decl.src.raw = None;
                return cloned_decl;
            }
        }

        decl
    }
}
