---
title: "第 06 章　用 always 描述組合邏輯"
author: "claude"
date: "2026.11.08"
tags: ["verilog","HDVL"]
---

## 學習目標

- 會用 `always @(*)` 寫組合邏輯
- 會用 `if` 和 `case` 描述「選擇」
- 理解為什麼組合邏輯用 `=`（阻塞賦值）
- **看懂並避免 latch（意外的記憶元件）**

---

## 6.1 為什麼需要 always？

`assign` 很適合簡單的運算，但遇到「**如果…就…否則…**」的邏輯就不好寫：

```verilog
assign y = (sel == 2'd0) ? d0 :
           (sel == 2'd1) ? d1 :
           (sel == 2'd2) ? d2 : d3;       // 能寫，但很難讀
```

用 `always` 搭配 `if` / `case`，可以寫得像一般程式一樣清楚：

```verilog
always @(*) begin
  case (sel)
    2'd0: y = d0;
    2'd1: y = d1;
    2'd2: y = d2;
    2'd3: y = d3;
  endcase
end
```

## 6.2 always @(*) 的結構

```verilog
always @(*) begin
  // 這裡可以寫 if / case / for 等
  y = ...;
end
```

| 部分 | 意思 |
|------|------|
| `always` | 「一直重複」的區塊 |
| `@(*)` | **敏感列表**：括號內是「什麼時候要重新執行」。`*` 表示「裡面讀到的任何訊號一變，就重新執行」 |
| `begin ... end` | 包住多行敘述 |

💡 `@(*)` 的意思：「只要 `always` 裡面用到的輸入有任何變化，就把整段重新算一遍」，這正是組合邏輯的行為：**輸入一變，輸出立刻重新算。**

### 規則

1. **在 `always` 裡賦值的訊號，必須宣告成 `reg`**（即使它最後是個組合邏輯，不是暫存器）
2. 組合邏輯用 **`=`（阻塞賦值）**
3. 敏感列表**一律寫 `@(*)`**，不要手寫 `@(a or b)`（容易漏掉訊號）

## 6.3 `if ... else`

```verilog
module mux2 (
  input  wire [7:0] a, b,
  input  wire       sel,
  output reg  [7:0] y
);
  always @(*) begin
    if (sel)
      y = b;
    else
      y = a;
  end
endmodule
```

注意 `output reg [7:0] y`：因為 `y` 在 `always` 裡賦值，所以是 `reg`。

⚠️ 一行以上要用 `begin ... end`：

```verilog
if (sel) begin
  y = b;
  z = 1'b1;
end else begin
  y = a;
  z = 1'b0;
end
```

## 6.4 `case`

適合「依某個值分成很多情況」。

```verilog
module mux4 (
  input  wire [7:0] d0, d1, d2, d3,
  input  wire [1:0] sel,
  output reg  [7:0] y
);
  always @(*) begin
    case (sel)
      2'b00:   y = d0;
      2'b01:   y = d1;
      2'b10:   y = d2;
      2'b11:   y = d3;
      default: y = 8'h00;
    endcase
  end
endmodule
```

### 逐行解說

| 程式 | 意思 |
|------|------|
| `case (sel)` | 看 `sel` 的值 |
| `2'b00: y = d0;` | `sel` 等於 `00` 時，`y = d0`。冒號前面是「條件值」 |
| `default:` | 其他沒列到的情況 |
| `endcase` | 結束 case（不加分號） |

### 測試 mux4

```verilog
`timescale 1ns/1ps
module tb_mux4;
  reg  [7:0] d0, d1, d2, d3;
  reg  [1:0] sel;
  wire [7:0] y;
  integer i;

  mux4 dut (.d0(d0), .d1(d1), .d2(d2), .d3(d3), .sel(sel), .y(y));

  initial begin
    d0 = 8'h11; d1 = 8'h22; d2 = 8'h33; d3 = 8'h44;
    for (i = 0; i < 4; i = i + 1) begin
      sel = i[1:0];
      #10;
      $display("sel=%0d y=%h", sel, y);
    end
    $finish;
  end
endmodule
```

預期輸出：

```
sel=0 y=11
sel=1 y=22
sel=2 y=33
sel=3 y=44
```

## 6.5 阻塞賦值 `=` 的意思

在組合邏輯的 `always` 裡，敘述**由上往下依序執行**，後面的敘述會看到前面剛算出來的值。

```verilog
always @(*) begin
  t = a & b;        // 先算出 t
  y = t | c;        // 再用剛算出的 t
end
```

這跟寫 C 的感覺很像，所以組合邏輯用 `=` 最直覺。（時序邏輯用 `<=`，第 8 章再說。）

> **目前先記住規則：組合邏輯 → `always @(*)` + `=`。**

## 6.5.1 同一個訊號可以先給預設值

```verilog
always @(*) begin
  y = 8'h00;              // 預設值
  if (en) y = a;          // 條件成立才覆蓋
end
```

這個寫法下面會用到，它是避免 latch 的好方法。

---

## 6.6 重點：latch（鎖存器）是什麼？

### 先看一個有問題的設計

```verilog
always @(*) begin
  if (en)
    y = a;
end
```

當 `en = 1` 時，`y = a`，沒問題。但當 `en = 0` 時**沒有寫 `y` 要等於什麼**。

這時合成工具會怎麼理解？答案：「那 `y` 要**保持原來的值**」。

**要保持值 → 就需要記憶 → 於是工具偷偷替你做出一個鎖存器 (latch)**，一種電路裡的記憶元件。

```
   a ──►┐
        │ latch ──► y     ← 你本來只想要組合邏輯，結果多了一個記憶元件！
   en ─►┘
```

### 為什麼不好？

- 你原本想要「沒有記憶」的組合邏輯，卻出現記憶
- 時序分析困難，行為不容易預測
- 多半是你的 bug，不是你的本意

### ✅ 避免 latch：兩個方法

**方法一：每個條件都有輸出（補 else / default）**

```verilog
always @(*) begin
  if (en) y = a;
  else    y = 8'h00;
end
```

**方法二：先給預設值（推薦）**

```verilog
always @(*) begin
  y = 8'h00;           // 預設值，不管之後怎樣都有值
  if (en) y = a;
end
```

### `case` 一樣

```verilog
// ❌ 沒有 default，sel 是 2'b11 時 y 沒有值 → latch
always @(*) begin
  case (sel)
    2'b00: y = d0;
    2'b01: y = d1;
    2'b10: y = d2;
  endcase
end

// ✅ 加 default
always @(*) begin
  case (sel)
    2'b00:   y = d0;
    2'b01:   y = d1;
    2'b10:   y = d2;
    default: y = 8'h00;
  endcase
end
```

### 🧪 實驗：親眼看到 latch

1. 寫成「有問題的版本」，模擬 `en` 由 1 變 0 的情況，你會發現 `y` 保持舊值（沒有回到 0）。
2. 如果有安裝 Yosys，可以用下面指令合成，並在輸出的統計中看到 `$dlatch` 之類的單元（表示 latch）：

```bash
yosys -p "read_verilog latch_bad.v; synth -top latch_bad; stat"
```

（第 13 章會詳細介紹工具。）

### 檢查口訣

> **「每一個 `always @(*)`，每一個輸出，在每一種情況下，都有被賦值嗎？」**

## 6.7 組合 always 的檢查清單

- [ ] 敏感列表寫 `@(*)`
- [ ] 裡面用 `=`
- [ ] 被賦值的訊號宣告成 `reg`
- [ ] 每個輸出在**所有情況**都有值（預設值 / else / default）
- [ ] 沒有讓輸出依賴它自己（例如 `y = y + 1;` 是組合迴圈 ❌）

## 6.8 `casez` 與萬用字元（進階一點點）

有時候某些位元「不在乎」，可以用 `casez` 配合 `?` 當萬用字元：

```verilog
always @(*) begin
  casez (req)
    4'b1???: idx = 2'd3;     // 最高位是 1 → 不管後面
    4'b01??: idx = 2'd2;
    4'b001?: idx = 2'd1;
    default: idx = 2'd0;
  endcase
end
```

這就是**優先權編碼器**：誰的位元最高，就優先處理。上面 `case` 是**由上往下**比對，先符合的先用。第 7 章會用到。

## 6.9 常見錯誤

| 錯誤 | 症狀 | 解法 |
|------|------|------|
| 忘了宣告 `reg` | 編譯錯誤 | `always` 裡賦值的訊號用 `reg` |
| 沒給預設值 / 缺 else / 缺 default | **latch** | 補齊 |
| 敏感列表手寫漏掉訊號 | 模擬結果怪怪的 | 用 `@(*)` |
| 把 `output wire` 在 always 裡賦值 | 編譯錯誤 | 改 `output reg` |
| 忘了 `begin end` | 只有第一行屬於 if | 多行就加 |
| `endcase` 後面加分號 | 小問題（通常仍可編譯） | 不加 |

## 本章小結

- 組合邏輯：`always @(*)` + `=`，被賦值的訊號是 `reg`
- `if / else` 和 `case` 描述選擇
- **latch** 是因為「某些情況沒給值」造成的意外記憶；**用預設值或 `default` 避免**
- 組合邏輯的 `reg` 不是暫存器

## 小測驗

**Q1.** 為什麼組合邏輯的 `always` 裡賦值的訊號要宣告成 `reg`？它會變成暫存器嗎？

<details><summary>看答案</summary>

因為 Verilog 語法規定在 `always` 裡賦值的訊號必須是 `reg` 型別。但**不會**變成暫存器，它仍然是組合邏輯，只是語法上的名稱。
</details>

**Q2.** 下列程式會產生 latch 嗎？為什麼？

```verilog
always @(*) begin
  if (a > b) y = 1'b1;
  else if (a < b) y = 1'b0;
end
```

<details><summary>看答案</summary>

**會**。當 `a == b` 時兩個條件都不成立，`y` 沒有被賦值，必須保持舊值 → latch。修正：補最後的 `else y = ...;`，或一開始給預設值。
</details>

**Q3.** `always @(*)` 裡面的 `*` 代表什麼？

<details><summary>看答案</summary>

自動把區塊內**讀取到的所有訊號**當作敏感訊號，其中任何一個改變就重新執行。
</details>

**Q4.** 想避免 latch，最簡單的一個習慣是什麼？

<details><summary>看答案</summary>

在 `always @(*)` 的**開頭先給所有輸出一個預設值**。
</details>

## 練習

1. 把 `mux4` 改成**用 `if / else if / else`** 寫一次，並用同一個 testbench 驗證。
2. 寫一個 `max2`（輸入 `a`、`b` 各 8 位元，輸出較大者），用 `always @(*)` 與 `if` 完成，不產生 latch。
3. 寫一個 `sign_detect`：輸入 8 位元 `x`，輸出 2 位元 `kind`：`00` = 零、`01` = 1~127、`10` = 128~255。（先畫出每種情況，確認全部覆蓋。）
4. 故意把練習 2 寫成缺 `else` 的版本，在波形中觀察 `y` 在 `a == b` 時保持舊值的現象。

---

⬅️ [上一章：5. 運算子與位元寬度](V05_運算子與位元寬度) ｜ [📚 回目錄](V00_目錄與學習地圖) ｜ [下一章：7. 組合邏輯實作](V07_組合邏輯實作) ➡️