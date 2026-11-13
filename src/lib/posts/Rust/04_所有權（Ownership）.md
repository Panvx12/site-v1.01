# 4. 所有權（Ownership）

> 所有權是 Rust 最核心、也最獨特的概念。理解它，就理解了 Rust 的一半。

### 4.1 三大規則

1. Rust 中每個值都有一個**擁有者（owner）**。
2. 同一時間只能有**一個**擁有者。
3. 當擁有者離開作用域（scope），該值會被**丟棄（drop）**，記憶體自動釋放。

### 4.2 Stack 與 Heap

| | Stack | Heap |
|---|-------|------|
| 大小 | 編譯期已知、固定 | 執行期決定、可變 |
| 速度 | 快 | 較慢（需配置） |
| 範例 | `i32`、`bool`、`char` | `String`、`Vec<T>` |

### 4.3 移動（Move）

```rust
let s1 = String::from("hello");
let s2 = s1;            // s1 的所有權「移動」給 s2
// println!("{s1}");    // ❌ s1 已失效
println!("{s2}");       // ✅
```

這避免了「雙重釋放（double free）」問題。

### 4.4 複製（Clone 與 Copy）

```rust
// 深層複製（明確、可能昂貴）
let s1 = String::from("hello");
let s2 = s1.clone();
println!("{s1} {s2}");   // ✅ 兩者都有效

// Copy：存在 stack 上的簡單型別，賦值時自動複製
let a = 5;
let b = a;
println!("{a} {b}");     // ✅
```

實作 `Copy` 的型別：所有整數、浮點數、`bool`、`char`，以及僅含 `Copy` 型別的元組。

### 4.5 所有權與函式

```rust
fn take(s: String) {
    println!("{s}");
}   // s 在此被 drop

fn make_copy(n: i32) {
    println!("{n}");
}

fn main() {
    let s = String::from("hi");
    take(s);                 // s 移動進函式
    // println!("{s}");      // ❌ 已失效

    let n = 5;
    make_copy(n);
    println!("{n}");         // ✅ i32 是 Copy
}
```

回傳值也可以轉移所有權：

```rust
fn give() -> String {
    String::from("yours")
}
```

---

⬅️ [上一章：3. 基本語法](03_基本語法.md) ｜ [📚 回目錄](00_目錄.md) ｜ [下一章：5. 借用與參考（References）](05_借用與參考（References）.md) ➡️
