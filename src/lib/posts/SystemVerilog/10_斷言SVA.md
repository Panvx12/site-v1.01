# 第 10 章　斷言 (SystemVerilog Assertions, SVA)

> 斷言用來**描述設計應有的行為**，在模擬（或形式驗證）時自動檢查。它能在錯誤發生的當下就報告，大幅縮短除錯時間。

## 10.1 兩種斷言

| 類型 | 特性 | 用途 |
|------|------|------|
| 立即斷言 (immediate) | 像 `if` 一樣在程式流程中執行，即時檢查 | 檢查當下的條件 |
| 並行斷言 (concurrent) | 以時脈為基準，描述跨週期的行為 | 時序行為驗證 |

### 立即斷言

```systemverilog
always_comb begin
  assert (a != b) else $error("a == b!");
end
```

### 並行斷言

```systemverilog
assert property (@(posedge clk) disable iff (!rst_n)
                 req |-> ##[1:3] ack)
  else $error("ack did not follow req within 3 cycles");
```

## 10.2 基本構成：sequence 與 property

```systemverilog
sequence s_req_ack;
  req ##1 ack;
endsequence

property p_handshake;
  @(posedge clk) disable iff (!rst_n)
  req |-> s_req_ack;
endproperty

a_handshake: assert property (p_handshake)
  else $error("handshake violated");
```

## 10.3 時序運算子

### 延遲 `##`

| 語法 | 意義 |
|------|------|
| `a ##1 b` | a 之後下一個週期 b |
| `a ##2 b` | a 之後第 2 個週期 b |
| `a ##[1:3] b` | a 之後 1~3 週期內某一週期 b |
| `a ##[1:$] b` | a 之後最終會出現 b（不限時間） |

### 重複

| 語法 | 意義 |
|------|------|
| `a[*3]` | a 連續 3 個週期 |
| `a[*1:3]` | a 連續 1~3 個週期 |
| `a[->1]` | 非連續，直到 a 出現第一次（結束於 a 為真的那個週期） |
| `a[=2]` | 非連續，a 出現 2 次 |

## 10.4 蘊含運算子

| 運算子 | 意義 |
|--------|------|
| `a \|-> b` | **重疊蘊含**：a 成立時，同一週期檢查 b |
| `a \|=> b` | **非重疊蘊含**：a 成立時，下一週期檢查 b |

> `a |=> b` 等同 `a |-> ##1 b`

若前提 (antecedent) `a` 不成立，該次檢查視為**空洞成功 (vacuous pass)**，不會失敗。

## 10.5 內建函式

| 函式 | 意義 |
|------|------|
| `$rose(x)` | x 由 0 變 1 |
| `$fell(x)` | x 由 1 變 0 |
| `$stable(x)` | x 與上一週期相同 |
| `$changed(x)` | x 與上一週期不同 |
| `$past(x, n)` | n 個週期前的 x |
| `$onehot(x)` / `$onehot0(x)` | 恰一位為 1 / 至多一位為 1 |
| `$countones(x)` | 1 的個數 |

## 10.6 常見範例

```systemverilog
// 1. req 發出後，valid 必須保持直到 ack
assert property (@(posedge clk) disable iff (!rst_n)
  $rose(req) |-> req throughout (##[1:10] ack));

// 2. FIFO 滿時不可寫入
assert property (@(posedge clk) disable iff (!rst_n)
  full |-> !wr_en);

// 3. 重置後所有輸出為 0
assert property (@(posedge clk)
  !rst_n |=> (cnt == 0));

// 4. 資料在 valid 期間必須穩定
assert property (@(posedge clk) disable iff (!rst_n)
  valid && !ready |=> $stable(data) && valid);

// 5. grant 為獨熱碼
assert property (@(posedge clk) disable iff (!rst_n)
  $onehot0(grant));
```

## 10.7 `assume` 與 `cover`

| 指令 | 用途 |
|------|------|
| `assert property` | 檢查設計「必須」滿足 |
| `assume property` | 限制輸入環境（形式驗證用；模擬時視同 assert） |
| `cover property` | 確認某情境**曾經發生**（量測驗證完整度） |

```systemverilog
c_burst: cover property (@(posedge clk) $rose(start) ##[1:20] done);
```

## 10.8 `disable iff` 與重置

```systemverilog
property p_x;
  @(posedge clk) disable iff (!rst_n) a |-> b;
endproperty
```

重置期間不評估斷言，避免誤報。

## 10.9 `bind`：不修改 DUT 附加斷言

```systemverilog
module my_checker (input logic clk, rst_n, req, ack);
  assert property (@(posedge clk) disable iff (!rst_n) req |-> ##[1:3] ack);
endmodule

bind dut my_checker u_chk (.clk(clk), .rst_n(rst_n), .req(req), .ack(ack));
```

斷言與設計分離，可在不碰 RTL 的情況下加入檢查。

## 10.10 除錯技巧

- 斷言失敗訊息請寫清楚（包含訊號名稱與預期行為）
- 在波形中觀察失敗時間點**之前**的訊號
- 注意 `|->` 與 `|=>` 的週期偏移，這是最常見的錯誤

## 練習

1. 為 4-phase handshake（req↑ → ack↑ → req↓ → ack↓）寫完整斷言。
2. 寫斷言：`start` 拉高後，`busy` 必須在 2 個週期內拉高，且 `done` 前保持。
3. 為 FIFO 寫斷言：空時不可讀、滿時不可寫、`count` 在 0~DEPTH 之間。
4. 對上述每個 assert，再寫一個對應的 `cover property`。

---

⬅️ [上一章：9. 隨機化與約束](09_隨機化與約束) ｜ [📚 回目錄](00_目錄與學習路線) ｜ [下一章：11. 功能覆蓋率](11_功能覆蓋率) ➡️