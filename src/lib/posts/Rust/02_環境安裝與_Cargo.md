# 2. 環境安裝與 Cargo

### 2.1 安裝 Rust

使用官方工具 **rustup**（Windows 可至 https://rustup.rs 下載安裝程式）：

```bash
# Linux / macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

驗證安裝：

```bash
rustc --version
cargo --version
```

常用維護指令：

```bash
rustup update        # 更新 Rust
rustup component add clippy rustfmt   # 安裝 linter 與格式化工具
```

> Windows 若使用 MSVC 工具鏈，需安裝 Visual Studio Build Tools（C++ 工作負載）。

### 2.2 Hello, World!

```bash
cargo new hello_rust
cd hello_rust
cargo run
```

`src/main.rs`：

```rust
fn main() {
    println!("Hello, world!");
}
```

### 2.3 Cargo 常用指令

| 指令 | 說明 |
|------|------|
| `cargo new <名稱>` | 建立新專案 |
| `cargo build` | 編譯（debug 模式） |
| `cargo build --release` | 最佳化編譯 |
| `cargo run` | 編譯並執行 |
| `cargo check` | 只檢查語法與型別（速度快） |
| `cargo test` | 執行測試 |
| `cargo fmt` | 格式化程式碼 |
| `cargo clippy` | 靜態分析建議 |
| `cargo doc --open` | 產生並開啟文件 |
| `cargo add <crate>` | 新增依賴 |

### 2.4 專案結構

```
hello_rust/
├── Cargo.toml     # 專案設定與依賴
├── Cargo.lock     # 鎖定依賴版本
└── src/
    └── main.rs    # 程式進入點
```

`Cargo.toml` 範例：

```toml
[package]
name = "hello_rust"
version = "0.1.0"
edition = "2024"

[dependencies]
serde = { version = "1", features = ["derive"] }
```

---

⬅️ [上一章：1. Rust 簡介](01_Rust_簡介) ｜ [📚 回目錄](00_目錄) ｜ [下一章：3. 基本語法](03_基本語法) ➡️
