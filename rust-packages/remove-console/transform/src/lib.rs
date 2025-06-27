// ============================================================================
// SWC 插件核心文件 - 詳細解釋
// ============================================================================
// 
// 這個文件的作用：
// 1. 實現一個 SWC 插件，用於移除 JavaScript 代碼中的 console 語句
// 2. 提供配置選項，可以選擇性地保留某些 console 方法
// 3. 展示如何編寫 SWC 轉換器（Transformer）
//
// 類比 JavaScript 概念：
// - 類似於 Babel 插件的實現
// - 類似於 Webpack loader 的轉換邏輯
// ============================================================================

// ============================================================================
// RUST 語法部分 - 導入模塊
// ============================================================================
// 導入序列化/反序列化庫
// serde 是 Rust 的序列化框架，類似於 JavaScript 的 JSON.parse/stringify
// serde = Serialization/Deserialization framework for Rust
// 語法: use crate::module;  // Rust 的導入語法，類似於 JavaScript 的 import
use serde::Deserialize;
// Deserialize: 用於從配置數據自動生成結構體實例
// Deserialize = 反序列化，將數據格式（如 JSON）轉換為 Rust 結構體
// 類似於 JavaScript 中的 Object.assign() 或解構賦值

// 導入 SWC 相關模塊
use swc_atoms::Atom;
// Atom: SWC 的字符串類型，類似於 JavaScript 的 Symbol 或 interned string
// Atom = 原子字符串，經過字符串駐留（string interning）優化的字符串類型
// 用於高效地存儲和比較字符串，避免重複分配內存

use swc_common::SyntaxContext;
// SyntaxContext: 語法上下文，用於跟蹤變量作用域和引用關係
// SyntaxContext = 語法上下文，包含語法標記（Syntax Mark）和解析上下文信息
// 類似於 JavaScript 引擎的作用域分析，用於區分不同作用域中的同名變量

use swc_ecma_ast::*;
// 導入所有 AST 節點類型
// AST = Abstract Syntax Tree（抽象語法樹），代碼的樹狀結構表示
// 類似於 JavaScript 中的 import * as AST from 'ast-types'
// 包含：Expr（表達式）, Stmt（語句）, Module（模塊）, CallExpr（調用表達式）, MemberExpr（成員表達式）等

use swc_ecma_visit::{fold_pass, noop_fold_type, Fold, FoldWith};
// SWC 的訪問者模式工具
// Visitor Pattern（訪問者模式）：一種設計模式，用於遍歷複雜數據結構
// - Fold: 轉換器特徵（trait），類似於 JavaScript 的接口（Interface）
// - FoldWith: 自動實現遍歷 AST 的方法，提供默認的遍歷邏輯
// - fold_pass: 將轉換器包裝為 Pass（轉換過程），使其可以被 SWC 管道處理
// - noop_fold_type: 宏（Macro），為未實現的方法提供默認實現（no-op = no operation）

// ============================================================================
// 配置結構體定義
// ============================================================================
// #[derive(...)] 是 Rust 的派生宏，自動實現指定的特徵
// Derive Macro（派生宏）：編譯時代碼生成工具，自動為類型實現特定特徵
// 語法: #[derive(Trait1, Trait2, ...)]  // Rust 宏語法，類似於 JavaScript 的裝飾器（Decorator）
#[derive(Clone, Debug, Deserialize)]
// - Clone: 允許結構體被複製，類似於 JavaScript 的淺拷貝（Shallow Copy）
// - Debug: 允許在調試時打印結構體，類似於 console.log()，實現 fmt::Debug 特徵
// - Deserialize: 允許從 JSON 等格式自動創建結構體實例，實現 serde::Deserialize 特徵

// #[serde(untagged)] 告訴 serde 這個枚舉是無標籤的
// Untagged Enum（無標籤枚舉）：序列化時不包含變體標籤，類似於 TypeScript 的聯合類型（Union Types）
#[serde(untagged)]
pub enum Config {
    // 語法: enum EnumName { Variant1(Type), Variant2(Struct) }  // Rust 枚舉語法
    // Enum（枚舉）：包含多個變體的類型，類似於 JavaScript 中的聯合類型或標籤聯合（Tagged Union）
    
    // 簡單配置：只接受布爾值
    // 語法: VariantName(Type)  // 枚舉變體，類似於 TypeScript 的 type Config = boolean
    All(bool),
    
    // 複雜配置：接受選項結構體
    // 語法: VariantName(StructType)  // 枚舉變體，類似於 TypeScript 的 interface Options
    WithOptions(Options),
}

// ============================================================================
// 實現塊 - 為 Config 枚舉添加方法
// ============================================================================
// 語法: impl TypeName { ... }  // Rust 實現塊，類似於 JavaScript 的 class 方法
// Implementation Block（實現塊）：為類型實現方法和關聯函數
impl Config {
    // 檢查配置是否為真值
    // 語法: pub fn method_name(&self) -> ReturnType { ... }  // Rust 方法定義
    // pub: 公開方法，類似於 JavaScript 的 public
    // &self: 借用 self 的引用，類似於 JavaScript 的 this
    pub fn truthy(&self) -> bool {
        // 語法: match expression { pattern => result, ... }  // Rust 模式匹配
        // Pattern Matching（模式匹配）：強大的解構和條件檢查機制，類似於 JavaScript 的 switch 或 if-else 鏈
        match self {
            // 語法: Config::VariantName(binding) => expression  // 模式匹配語法
            // binding 會綁定到枚舉變體中的值
            Config::All(b) => *b,  // *b 解引用（Dereference），獲取布爾值
            Config::WithOptions(_) => true,  // _ 表示忽略這個值（Wildcard Pattern）
        }
    }
}

// ============================================================================
// 選項結構體定義
// ============================================================================
#[derive(Clone, Debug, Deserialize)]
pub struct Options {
    // 語法: pub field_name: Type  // Rust 結構體字段定義
    // Struct（結構體）：自定義複合數據類型，類似於 TypeScript 的 interface 或 JavaScript 的對象屬性
    
    // #[serde(default)] 告訴 serde 如果沒有提供這個字段，使用默認值
    // Default Value（默認值）：當配置中缺少該字段時使用的值
    // 類似於 JavaScript 的 { exclude = [] }
    #[serde(default)]
    pub exclude: Vec<Atom>,  // Vec<Atom> 是字符串向量，類似於 JavaScript 的 string[]
    // Vec = Vector（向量）：動態數組，類似於 JavaScript 的 Array
}

// ============================================================================
// 主要轉換器結構體
// ============================================================================
// 語法: struct StructName { field1: Type1, field2: Type2 }  // Rust 結構體定義
// 結構體類似於 JavaScript 的 class 或 TypeScript 的 interface
struct RemoveConsole {
    exclude: Vec<Atom>,           // 要排除的 console 方法列表
    unresolved_ctxt: SyntaxContext,  // 未解析的語法上下文
}

// ============================================================================
// 實現塊 - 為 RemoveConsole 添加方法
// ============================================================================
impl RemoveConsole {
    // 檢查標識符是否為全局 console 對象
    // 語法: fn method_name(&self, parameter: &Type) -> ReturnType { ... }
    // &self: 借用 self 的引用，類似於 JavaScript 的 this
    // &Type: 借用參數的引用，避免所有權轉移（Ownership Transfer）
    fn is_global_console(&self, ident: &Ident) -> bool {
        // 語法: &ident.sym == "string"  // 字符串比較
        // ident.sym 是標識符的字符串值，類似於 JavaScript 的 identifier.name
        // Ident = Identifier（標識符）：變量名、函數名等
        &ident.sym == "console" && ident.ctxt == self.unresolved_ctxt
        // 檢查：
        // 1. 標識符名稱是否為 "console"
        // 2. 語法上下文是否匹配（確保是全局變量）
    }

    // 判斷是否應該移除函數調用
    // 語法: &mut self  // 可變借用（Mutable Borrow），允許修改 self
    fn should_remove_call(&mut self, n: &CallExpr) -> bool {
        // 語法: let variable = expression;  // Rust 變量聲明，類似於 JavaScript 的 const
        let callee = &n.callee;  // 獲取被調用的表達式
        // Callee（被調用者）：函數調用中被調用的表達式
        
        // 語法: match expression { pattern => result, ... }  // 模式匹配
        let member_expr = match callee {
            // 語法: Callee::Variant(expr) => match &**expr { ... }  // 嵌套模式匹配
            // &**expr 是雙重解引用（Double Dereference），獲取表達式的實際值
            Callee::Expr(e) => match &**e {
                // 語法: Expr::Variant(m) => m  // 匹配特定的表達式類型
                Expr::Member(m) => m,  // 如果是成員表達式，返回它
                _ => return false,     // 其他情況返回 false
            },
            _ => return false,  // 其他調用類型返回 false
        };

        // 不要嘗試評估計算屬性
        // 語法: matches!(expression, Pattern)  // Rust 宏，檢查是否匹配模式
        // Computed Property（計算屬性）：使用表達式作為屬性名的屬性
        // 類似於 JavaScript 的 typeof value === 'object'
        if matches!(&member_expr.prop, MemberProp::Computed(..)) {
            return false;  // 計算屬性太複雜，跳過
        }

        // 只處理全局 `console` 對象
        // 語法: match &*expression { pattern => result, ... }  // 模式匹配
        match &*member_expr.obj {
            // 語法: Expr::Ident(i) if condition => result  // 帶條件的模式匹配
            // Guard Clause（守衛子句）：在模式匹配中添加額外條件
            // 類似於 JavaScript 的 if (expr.type === 'Identifier' && condition)
            Expr::Ident(i) if self.is_global_console(i) => {}
            _ => return false,  // 不是全局 console，跳過
        }

        // 檢查屬性是否在排除列表中
        // 這裡進行 O(n) 搜索，因為排除列表通常很小
        // Time Complexity（時間複雜度）：算法執行時間與輸入大小的關係
        match &member_expr.prop {
            // 語法: MemberProp::Ident(i) if !condition => result  // 條件模式匹配
            MemberProp::Ident(i) if !self.exclude.contains(&i.sym) => {}
            _ => return false,  // 屬性被排除或不是標識符，跳過
        }

        true  // 所有條件都滿足，應該移除
    }
}

// ============================================================================
// 實現 Fold 特徵 - 核心轉換邏輯
// ============================================================================
// 語法: impl TraitName for TypeName { ... }  // 實現特徵，類似於 JavaScript 的 implements
// Trait（特徵）：定義共享行為的接口，類似於其他語言的接口（Interface）或抽象類（Abstract Class）
impl Fold for RemoveConsole {
    // 語法: noop_fold_type!();  // Rust 宏，為未實現的方法提供默認實現
    // no-op = No Operation（無操作），表示不執行任何操作的默認實現
    // 類似於 JavaScript 中的 Object.assign(defaults, customMethods)
    noop_fold_type!();

    // 轉換模塊 - 處理頂層語句
    // 語法: fn method_name(&mut self, parameter: Type) -> Type { ... }
    fn fold_module(&mut self, module: Module) -> Module {
        // 語法: let mut variable = Vec::new();  // 創建可變向量
        // Vec 類似於 JavaScript 的 Array
        let mut items = Vec::new();
        
        // 語法: for item in collection { ... }  // Rust 循環，類似於 JavaScript 的 for...of
        for item in module.body {
            // 語法: match expression { pattern => result, ... }  // 模式匹配
            match item {
                // 語法: ModuleItem::Variant(inner_pattern) => { ... }  // 嵌套模式匹配
                ModuleItem::Stmt(Stmt::Expr(expr_stmt)) => {
                    // 語法: if let pattern = expression { ... }  // if let 語法
                    // if let 是 match 的簡化形式，只處理單個模式
                    // 類似於 JavaScript 的 if (expression.type === 'CallExpression')
                    if let Expr::Call(call_expr) = &*expr_stmt.expr {
                        if self.should_remove_call(call_expr) {
                            // 跳過這個 console 調用
                            // 語法: continue;  // 跳過當前迭代，類似於 JavaScript 的 continue
                            continue;
                        }
                    }
                    // 語法: variable.push(expression)  // 向向量添加元素
                    // 類似於 JavaScript 的 array.push()
                    items.push(ModuleItem::Stmt(Stmt::Expr(expr_stmt.fold_with(self))));
                }
                _ => {
                    // 其他類型的模塊項目，遞歸轉換
                    // Recursion（遞歸）：函數調用自身的過程
                    items.push(item.fold_with(self));
                }
            }
        }
        
        // 語法: StructName { field: value, ..original }  // 結構體更新語法
        // Struct Update Syntax（結構體更新語法）：基於現有結構體創建新結構體
        // 類似於 JavaScript 的 { ...original, field: value }
        Module {
            body: items,  // 使用新的項目列表
            ..module      // 保持其他字段不變
        }
    }

    // 轉換塊語句 - 處理函數體、if 語句等
    // Block Statement（塊語句）：由大括號包圍的語句序列
    fn fold_block_stmt(&mut self, block: BlockStmt) -> BlockStmt {
        // 語法: let mut variable = Vec::new();  // 創建可變向量
        let mut stmts = Vec::new();
        
        // 遍歷所有語句
        for stmt in block.stmts {
            match stmt {
                // 處理表達式語句
                // Expression Statement（表達式語句）：以表達式結尾的語句
                Stmt::Expr(expr_stmt) => {
                    if let Expr::Call(call_expr) = &*expr_stmt.expr {
                        if self.should_remove_call(call_expr) {
                            // 跳過這個 console 調用
                            continue;
                        }
                    }
                    stmts.push(Stmt::Expr(expr_stmt.fold_with(self)));
                }
                _ => {
                    // 其他類型的語句，遞歸轉換
                    stmts.push(stmt.fold_with(self));
                }
            }
        }
        
        // 返回新的塊語句
        BlockStmt {
            stmts,  // 使用新的語句列表
            ..block // 保持其他字段不變
        }
    }
}

// ============================================================================
// 公共 API 函數
// ============================================================================
// 語法: pub fn function_name(parameter: Type, parameter: Type) -> impl Trait { ... }
// pub: 公開函數，類似於 JavaScript 的 export
// impl Trait: 返回實現指定特徵的類型，類似於 TypeScript 的泛型約束（Generic Constraint）
pub fn remove_console(config: Config, unresolved_ctxt: SyntaxContext) -> impl Pass {
    // 語法: let variable = match expression { pattern => result, ... }  // 模式匹配賦值
    let exclude = match config {
        Config::WithOptions(x) => x.exclude,  // 如果有選項，使用排除列表
        _ => vec![],  // 否則使用空列表
    };
    
    // 語法: function_name(StructName { field: value, ... })  // 結構體構造
    // 類似於 JavaScript 的 new ClassName({ field: value })
    fold_pass(RemoveConsole {
        exclude,           // 排除列表
        unresolved_ctxt,   // 語法上下文
    })
}

// ============================================================================
// Rust 語法總結
// ============================================================================
//
// 基礎語法:
// - use module::Type;                    // 導入，類似於 import
// - #[derive(Trait1, Trait2)]            // 派生宏，類似於裝飾器
// - pub enum Enum { Variant(Type) }      // 枚舉，類似於聯合類型
// - pub struct Struct { field: Type }    // 結構體，類似於 interface
// - impl Type { fn method(&self) {} }    // 實現塊，類似於 class 方法
// - match expr { pattern => result }     // 模式匹配，類似於 switch
// - let variable = value;                // 變量聲明，類似於 const
// - if let pattern = expr { }            // 條件模式匹配
// - Vec::new()                           // 創建向量，類似於 []
// - variable.push(value)                 // 添加元素，類似於 push()
//
// 關鍵概念:
// - 所有權系統（Ownership System）: 每個值只有一個所有者
// - 借用檢查（Borrow Checker）: & 表示借用引用，&mut 表示可變借用
// - 模式匹配（Pattern Matching）: 強大的解構和條件檢查
// - 特徵系統（Trait System）: 類似於接口或抽象類
// - 宏系統（Macro System）: 編譯時代碼生成
// - 錯誤處理（Error Handling）: Result 和 Option 類型
//
// SWC 插件概念:
// - Fold 特徵（Fold Trait）: 定義如何轉換 AST 節點
// - 訪問者模式（Visitor Pattern）: 遍歷和修改 AST
// - 語法上下文（Syntax Context）: 跟蹤變量作用域
// - 原子字符串（Atom）: 高效的字符串比較
// - 抽象語法樹（Abstract Syntax Tree）: 代碼的樹狀結構表示
// - 轉換器（Transformer）: 修改 AST 的工具
// - 管道（Pipeline）: 多個轉換器組成的處理鏈
