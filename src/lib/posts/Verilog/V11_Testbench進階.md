# 第 11 章　Testbench 進階

## 學習目標

- 寫出「會自己判斷對錯」的 testbench
- 會用 `function` 寫參考模型、用 `task` 包裝重複動作
- 會做隨機測試、讀檔測試
- 會加逾時保護與命令列選項
- 知道好 testbench 的標準

> 本章的 DUT 使用第 7 章的 `alu`。請把 `alu.v` 放在同一個資料夾。

---

## 11.1 為什麼要「自我檢查」？

之前我們大多是**自己看印出來的結果**。但：

- 窮舉 65536 種組合，人眼看不完
- 改了設計之後，要重新檢查一次，很累
- 人會看錯、會漏看

所以專業做法是：**testbench 自己算出「正確答案」，和 DUT 的輸出比對，最後只告訴你 PASSED 或 FAILED。**

```
  激勵 ──┬──► [ DUT ] ──► 實際輸出 ──┐
         │                           ├─► 比對 ─► PASSED / FAILED
         └──► [參考模型] ─► 預期輸出 ─┘
```

## 11.2 參考模型：用 function

`function` 是「**輸入 → 算出一個值**」的小工具，不耗時間（裡面不能有 `#` 或 `@`）。

```verilog
function [7:0] ref_alu;
  input [7:0] fa, fb;
  input [2:0] fop;
  begin
    case (fop)
      3'd0:    ref_alu = fa + fb;
      3'd1:    ref_alu = fa - fb;
      3'd2:    ref_alu = fa & fb;
      3'd3:    ref_alu = fa | fb;
      3'd4:    ref_alu = fa ^ fb;
      3'd5:    ref_alu = fa << 1;
      3'd6:    ref_alu = fa >> 1;
      default: ref_alu = 8'h00;
    endcase
  end
endfunction
```

### 語法重點

- `function [7:0] ref_alu;`：函式名稱 `ref_alu`，回傳 8 位元
- **回傳值就是「把結果賦值給函式名稱」**：`ref_alu = ...`
- 輸入用 `input` 宣告（至少一個）
- 用法：`expected = ref_alu(a, b, op);`

⚠️ 參考模型**要用另一種寫法**去實作，不要直接複製設計的程式碼。否則設計錯了，參考模型也跟著錯，永遠比對得過。這裡因為 ALU 很簡單，只是示範。

## 11.3 task：把重複動作包起來

`task` 和 `function` 的差別：

| | function | task |
|---|----------|------|
| 可以有時間延遲 (`#`、`@`) | ❌ | ✅ |
| 回傳值 | 一個 | 沒有（用 output 參數） |
| 用途 | 計算 | 一連串動作 |

```verilog
task apply_and_check;
  input [7:0] ta, tb2;
  input [2:0] top;
  reg [7:0] expected;
  begin
    a = ta; b = tb2; op = top;       // 1. 送出輸入
    #1;                              // 2. 等組合邏輯穩定
    expected = ref_alu(ta, tb2, top);// 3. 算預期答案
    count = count + 1;
    if (y !== expected || zero !== (expected == 8'h00)) begin
      errors = errors + 1;
      $display("ERROR: a=%h b=%h op=%0d y=%h expected=%h",
               a, b, op, y, expected);
    end
  end
endtask
```

之後只要一行 `apply_and_check(8'd12, 8'd5, 3'd0);` 就完成「送輸入、等待、比對」。

## 11.4 完整的自我檢查 testbench

檔名 `tb_alu_adv.v`：

```verilog
`timescale 1ns/1ps
module tb_alu_adv;
  reg  [7:0] a, b;
  reg  [2:0] op;
  wire [7:0] y;
  wire       zero;
  integer    errors, count, i;

  alu dut (.a(a), .b(b), .op(op), .y(y), .zero(zero));

  // ---- 參考模型 ----
  function [7:0] ref_alu;
    input [7:0] fa, fb;
    input [2:0] fop;
    begin
      case (fop)
        3'd0:    ref_alu = fa + fb;
        3'd1:    ref_alu = fa - fb;
        3'd2:    ref_alu = fa & fb;
        3'd3:    ref_alu = fa | fb;
        3'd4:    ref_alu = fa ^ fb;
        3'd5:    ref_alu = fa << 1;
        3'd6:    ref_alu = fa >> 1;
        default: ref_alu = 8'h00;
      endcase
    end
  endfunction

  // ---- 送輸入並比對 ----
  task apply_and_check;
    input [7:0] ta, tb2;
    input [2:0] top;
    reg [7:0] expected;
    begin
      a = ta; b = tb2; op = top;
      #1;
      expected = ref_alu(ta, tb2, top);
      count = count + 1;
      if (y !== expected || zero !== (expected == 8'h00)) begin
        errors = errors + 1;
        $display("ERROR: a=%h b=%h op=%0d y=%h expected=%h",
                 a, b, op, y, expected);
      end
    end
  endtask

  // ---- 主測試流程 ----
  initial begin
    errors = 0;
    count  = 0;

    // 第 1 部分：手選的特殊情況（directed test）
    apply_and_check(8'd12,  8'd5, 3'd0);   // 一般加法
    apply_and_check(8'd0,   8'd0, 3'd0);   // 全 0
    apply_and_check(8'd255, 8'd1, 3'd0);   // 溢位
    apply_and_check(8'd5,   8'd5, 3'd1);   // 結果為 0
    apply_and_check(8'd3,   8'd5, 3'd1);   // 減成負數（繞回）

    // 第 2 部分：隨機測試
    for (i = 0; i < 200; i = i + 1)
      apply_and_check($random, $random, {$random} % 8);

    // 總結
    if (errors == 0)
      $display("ALU PASSED: %0d tests", count);
    else
      $display("ALU FAILED: %0d errors in %0d tests", errors, count);
    $finish;
  end

  // ---- 逾時保護 ----
  initial begin
    #100000;
    $display("*** TIMEOUT ***");
    $finish;
  end
endmodule
```

### 編譯與執行

```bash
iverilog -g2005 -Wall -o sim.vvp alu.v tb_alu_adv.v
vvp sim.vvp
```

### 預期輸出

```
ALU PASSED: 205 tests
```

205 = 5 個手選測試 + 200 個隨機測試。

### 新語法說明

| 寫法 | 意思 |
|------|------|
| `$random` | 傳回 32 位元的隨機整數（餵給 8 位元的輸入時只取低 8 位） |
| `{$random} % 8` | 大括號把 `$random` 變成**無號數**再取餘數，得到 0~7。若不加大括號，`$random` 可能是負數，餘數也會是負的 |
| `errors` / `count` | 計數器，記錄錯誤數與測試數 |
| 逾時 `initial` | 設計若卡住，模擬不會永遠跑下去 |

## 11.5 🧪 蓄意植入錯誤（檢驗你的 testbench）

好的 testbench 要**抓得到錯誤**。實驗：把 `alu.v` 裡 `3'd1: y = a - b;` 故意改成 `3'd1: y = a + b;`，重新模擬。

預期看到類似（第一個錯誤一定出現在第 4 個手選測試）：

```
ERROR: a=05 b=05 op=1 y=0a expected=00
...
ALU FAILED: ... errors in 205 tests
```

如果「植入錯誤」後 testbench 還顯示 PASSED，表示 **testbench 本身有漏洞**。這個練習叫**突變測試 (mutation testing)**，是檢查驗證品質的好方法。做完記得把 `alu.v` 改回來。

## 11.6 手選測試 vs 隨機測試

| | Directed（手選） | Random（隨機） |
|---|------------------|---------------|
| 做法 | 自己挑關鍵情況 | 讓電腦隨機產生 |
| 優點 | 一定測到邊界（0、最大值、溢位） | 能發現你沒想到的情況 |
| 缺點 | 只測得到你想到的 | 可能剛好沒碰到關鍵情況 |

**兩種搭配使用**最好：手選保證關鍵，隨機補漏。

### 隨機要「可重現」

```verilog
integer seed;
initial seed = 1;
...
a = $random(seed);     // 帶種子：同樣的 seed 會產生同樣的序列
```

發現 bug 時，記下種子才能重現。Verilog 內建的 `$random` 只能做簡單隨機（沒有「約束」功能，那是 SystemVerilog 的事）。

## 11.7 窮舉測試

輸入空間小時（例：兩個 4 位元），直接**全部試一遍**：

```verilog
for (i = 0; i < 16; i = i + 1)
  for (j = 0; j < 16; j = j + 1)
    apply_and_check(i[7:0], j[7:0], 3'd0);
```

兩個 8 位元就是 65536 組，電腦也瞬間跑完。

## 11.8 從檔案讀測試向量

測試資料可以放在檔案，用 `$readmemh` 一次讀進陣列。

### 資料檔 `vectors.hex`（每行一筆，十六進位）

```
0C0500
0C0501
FF0102
```

每行 24 位元：前 8 位元 = `a`，中間 8 位元 = `b`，最後 8 位元 = `op`。

- `0C0500`：a=0x0C(12)、b=0x05(5)、op=0（加）
- `0C0501`：同樣數字，op=1（減）
- `FF0102`：a=0xFF、b=0x01、op=2（AND）

### Testbench

```verilog
`timescale 1ns/1ps
module tb_vec;
  reg  [23:0] vec [0:2];       // 3 筆、每筆 24 位元
  reg  [23:0] word;
  reg  [7:0]  a, b;
  reg  [2:0]  op;
  wire [7:0]  y;
  wire        zero;
  integer     i;

  alu dut (.a(a), .b(b), .op(op), .y(y), .zero(zero));

  initial begin
    $readmemh("vectors.hex", vec);
    for (i = 0; i < 3; i = i + 1) begin
      word = vec[i];
      a  = word[23:16];
      b  = word[15:8];
      op = word[2:0];
      #1;
      $display("a=%h b=%h op=%0d y=%h", a, b, op, y);
    end
    $finish;
  end
endmodule
```

### 預期輸出

```
a=0c b=05 op=0 y=11
a=0c b=05 op=1 y=07
a=ff b=01 op=2 y=01
```

驗算：12+5=17=0x11、12−5=7、0xFF & 0x01=0x01 ✓。

⚠️ `vectors.hex` 必須放在**執行 `vvp` 的資料夾**（目前所在位置），否則讀不到，陣列會是 `x`。

### 寫結果到檔案

```verilog
integer fd;
initial begin
  fd = $fopen("result.log", "w");
  $fdisplay(fd, "hello %0d", 123);
  $fclose(fd);
end
```

## 11.9 命令列選項：`$test$plusargs`

不用改程式，從執行指令控制行為：

```verilog
reg verbose;
initial verbose = $test$plusargs("VERBOSE");   // 有給 +VERBOSE 就非 0

// 在 task 裡：
if (verbose) $display("a=%h b=%h op=%0d y=%h", a, b, op, y);
```

```bash
vvp sim.vvp              # 安靜模式
vvp sim.vvp +VERBOSE     # 印出詳細資訊
```

## 11.10 同時做幾件事：fork / join

```verilog
initial begin
  fork
    begin #10 $display("A at %0d", $time); end
    begin #20 $display("B at %0d", $time); end
  join
  $display("both done at %0d", $time);
end
```

輸出：

```
A at 10
B at 20
both done at 20
```

`fork ... join` 會**同時啟動**裡面所有區塊，並等**全部完成**才繼續。常用於「同時驅動多個介面」。

## 11.11 好 testbench 的檢查清單

- [ ] 輸入在**下降緣**改變（避免競爭）
- [ ] **自我檢查**，不靠人眼
- [ ] 結尾明確印出 **PASSED / FAILED**
- [ ] 有**逾時保護**
- [ ] 同時有 **directed**（邊界）和 **random**（補漏）
- [ ] 隨機要有**種子**，可重現
- [ ] 做過**突變測試**，確認抓得到錯誤
- [ ] 重置期間與重置放開後都測過
- [ ] 比對用 `!==`，能抓 `x` / `z`

### 在腳本中判斷結果

`$finish` 不會回傳失敗的結束碼，所以可以靠輸出字串判斷：

```bash
vvp sim.vvp | tee sim.log
grep -q "PASSED" sim.log && echo "OK" || echo "FAIL"
```

## 11.12 常見錯誤

| 錯誤 | 說明 | 解法 |
|------|------|------|
| 在 function 裡用 `#` 或 `@` | 編譯錯誤 | 需要延遲就用 task |
| 忘了給函式賦回傳值 | 回傳 `x` | `函式名稱 = 結果;` |
| `$random % 8` | 可能是負數 | `{$random} % 8` |
| 隨機測試沒有種子 | 無法重現 bug | 記錄種子 |
| 只比對「一般情況」 | 漏掉邊界 | 加 0、最大值、溢位 |
| `vectors.hex` 找不到 | 路徑不對 | 放在執行目錄 |
| 用 `==` 比對 | 漏掉 `x` | 用 `!==` |
| 用同一份程式碼做設計與參考模型 | 錯誤同時出現，永遠通過 | 參考模型用不同寫法 |

## 本章小結

- **參考模型 (function) + 比對 + PASSED/FAILED** = 自我檢查
- `task` 包裝重複動作；`function` 做計算
- 手選 + 隨機 + 窮舉，互補使用
- **突變測試**：故意改壞設計，確認 testbench 抓得到
- 逾時保護、種子、`!==` 是基本功

## 小測驗

**Q1.** `function` 與 `task` 最大的差別？

<details><summary>看答案</summary>

`function` 不能包含時間延遲 (`#`、`@`)，回傳一個值；`task` 可以有延遲，沒有回傳值。
</details>

**Q2.** 為什麼要寫 `{$random} % 8` 而不是 `$random % 8`？

<details><summary>看答案</summary>

`$random` 是有號數，可能是負的，取餘數後也可能是負的。加大括號轉成無號數，才會得到 0~7。
</details>

**Q3.** 突變測試的目的是什麼？

<details><summary>看答案</summary>

故意把設計改壞，確認 testbench **真的會報錯**。如果改壞了還顯示 PASSED，代表 testbench 有漏洞。
</details>

**Q4.** 為什麼比對輸出要用 `!==` 而不是 `!=`？

<details><summary>看答案</summary>

`!=` 遇到 `x`/`z` 結果會是 `x`（`if` 當作假），錯誤被漏掉；`!==` 會連 `x`/`z` 都當成不相等，能抓到。
</details>

## 練習

1. 為第 7 章的 `cmp4` 寫自我檢查 testbench：窮舉 256 種，驗證 `lt`、`eq`、`gt` 都正確，並驗證三者只有一個為 1。
2. 為第 10 章的 `seq_detect_101` 寫**自我檢查** testbench：用一個「軟體模型」（記住最近三個位元的 `reg [2:0]`，判斷是否等於 `3'b101`）計算預期的 `found`，再與 DUT 比對。送入 500 個隨機位元。（提示：Moore 輸出比輸入慢一拍，參考模型也要晚一拍比對。）
3. 為第 9 章的 `counter_mod10` 寫自我檢查 testbench：用整數 `expected` 自己數數，每個時脈比對。
4. 為 `alu` 的 testbench 加上 `+SEED=n` 選項。（提示：`$value$plusargs("SEED=%d", seed)`。）
5. 做突變測試：故意在 `alu` 裡改壞三個不同的地方，分別確認 testbench 都能抓到。
