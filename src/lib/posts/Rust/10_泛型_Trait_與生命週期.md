# 10. 泛型、Trait 與生命週期

### 10.1 泛型（Generics）

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut max = list[0];
    for &item in list {
        if item > max {
            max = item;
        }
    }
    max
}

struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T { &self.x }
}
```

泛型在編譯期會被**單態化（monomorphization）**，因此沒有執行期額外開銷。

### 10.2 Trait：定義共同行為

Trait 類似其他語言的 interface：

```rust
trait Summary {
    fn author(&self) -> String;

    // 預設實作
    fn summarize(&self) -> String {
        format!("(作者：{} 的文章...)", self.author())
    }
}

struct Article { title: String, writer: String }

impl Summary for Article {
    fn author(&self) -> String { self.writer.clone() }
}
```

**Trait 作為參數**

```rust
fn notify(item: &impl Summary) {
    println!("快訊！{}", item.summarize());
}

// 等價的 trait bound 寫法
fn notify2<T: Summary>(item: &T) { /* ... */ }

// 多重約束與 where 子句
fn some<T, U>(t: &T, u: &U) -> i32
where
    T: Summary + Clone,
    U: Clone + std::fmt::Debug,
{ 0 }
```

**常用標準 Trait**

| Trait | 用途 |
|-------|------|
| `Debug` / `Display` | 格式化輸出 `{:?}` / `{}` |
| `Clone` / `Copy` | 複製 |
| `PartialEq` / `Eq` | 相等比較 |
| `PartialOrd` / `Ord` | 排序 |
| `Default` | 預設值 |
| `Iterator` | 迭代器 |
| `From` / `Into` | 型別轉換 |
| `Drop` | 自訂釋放邏輯 |

使用 `#[derive(...)]` 自動實作：

```rust
#[derive(Debug, Clone, PartialEq, Default)]
struct Config {
    name: String,
    retries: u32,
}
```

### 10.3 Trait 物件（動態分派）

```rust
trait Shape {
    fn area(&self) -> f64;
}
struct Circle(f64);
struct Square(f64);

impl Shape for Circle { fn area(&self) -> f64 { 3.14159 * self.0 * self.0 } }
impl Shape for Square { fn area(&self) -> f64 { self.0 * self.0 } }

fn main() {
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Circle(1.0)),
        Box::new(Square(2.0)),
    ];
    for s in &shapes {
        println!("{:.2}", s.area());
    }
}
```

| | 泛型 `impl Trait` | `dyn Trait` |
|---|------------------|-------------|
| 分派 | 靜態（編譯期） | 動態（執行期，vtable） |
| 效能 | 最佳 | 略有開銷 |
| 能否混放不同型別於同一集合 | ❌ | ✅ |

### 10.4 生命週期（Lifetimes）

生命週期標註用來告訴編譯器**參考之間的有效期關係**，不會改變參考實際存活多久。

```rust
// 回傳值的生命週期 'a 與兩個輸入中較短者相同
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let a = String::from("long string");
    let result;
    {
        let b = String::from("xyz");
        result = longest(a.as_str(), b.as_str());
        println!("{result}");   // ✅ 在 b 存活期間使用
    }
    // println!("{result}");    // ❌ b 已被 drop
}
```

結構體持有參考時也需要標註：

```rust
struct Excerpt<'a> {
    part: &'a str,
}
```

**生命週期省略規則**（多數情況不需手寫）：

1. 每個參考參數各自獲得獨立的生命週期。
2. 只有一個輸入生命週期時，它會賦予所有輸出。
3. 若有 `&self` 或 `&mut self`，則 `self` 的生命週期賦予所有輸出。

`'static` 表示整個程式執行期間皆有效（如字串字面值）。

---

⬅️ [上一章：9. 集合型別](09_集合型別) ｜ [📚 回目錄](00_目錄) ｜ [下一章：11. 閉包與迭代器](11_閉包與迭代器) ➡️
