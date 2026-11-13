# 第 7 章　Testbench 基礎

## 7.1 Testbench 的組成

```
 ┌──────────────── Testbench ────────────────┐
 │  Stimulus  →  [  DUT  ]  →  Checker       │
 │  (激勵)        (待測)       (檢查)         │
 └───────────────────────────────────────────┘
```

Testbench 本身沒有輸入輸出埠，包含：時脈/重置產生、激勵、DUT 實例、檢查與報告。

## 7.2 `initial` 與 `always`

```systemverilog
module tb;
  logic clk = 0;
  logic rst_n;

  // 時脈：週期 10
  always #5 clk = ~clk;

  initial begin
    rst_n = 0;
    #20 rst_n = 1;
  end
endmodule
```

- `initial`：模擬開始時執行一次
- `always`：重複執行（testbench 中常用於時脈）

## 7.3 時間控制

| 語法 | 意義 |
|------|------|
| `#10` | 延遲 10 個時間單位 |
| `@(posedge clk)` | 等待事件 |
| `wait (cond)` | 等待條件成立（位準） |
| `repeat (n) @(posedge clk)` | 等 n 個時脈 |

## 7.4 Task 與 Function

```systemverilog
// function：不耗時
function automatic int parity(input logic [7:0] d);
  return ^d;
endfunction

// task：可耗時
task automatic wait_cycles(input int n);
  repeat (n) @(posedge clk);
endtask
```

⚠️ testbench 中建議一律加 `automatic`，避免多執行緒共用同一份靜態變數造成錯誤。

## 7.5 完整範例：計數器 testbench

DUT 使用第 5 章的 `counter`。

```systemverilog
`timescale 1ns/1ps
module tb_counter;
  localparam int W = 4;

  logic         clk = 0;
  logic         rst_n, en;
  logic [W-1:0] cnt;

  counter #(.W(W)) dut (.*);

  always #5 clk = ~clk;

  // 參考模型
  logic [W-1:0] expected;
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)  expected <= '0;
    else if (en) expected <= expected + 1'b1;
  end

  int errors = 0;

  // 自我檢查：在時脈負緣比對，避開競爭
  always @(negedge clk) begin
    if (rst_n && cnt !== expected) begin
      $error("[%0t] mismatch: cnt=%0d expected=%0d", $time, cnt, expected);
      errors++;
    end
  end

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, tb_counter);

    rst_n = 0; en = 0;
    repeat (3) @(posedge clk);
    rst_n = 1;

    en = 1;
    repeat (20) @(posedge clk);
    en = 0;
    repeat (3) @(posedge clk);
    en = 1;
    repeat (10) @(posedge clk);

    if (errors == 0) $display("*** TEST PASSED ***");
    else             $display("*** TEST FAILED: %0d errors ***", errors);
    $finish;
  end
endmodule
```

重點：

- `!==` 為「全等」比較，可正確比較 X/Z
- `$error`、`$warning`、`$info`、`$fatal` 為嚴重性分級的訊息工作
- `$dumpfile` / `$dumpvars` 輸出波形，用 GTKWave 觀看

## 7.6 `fork ... join`

並行執行多個執行緒。

| 語法 | 結束條件 |
|------|----------|
| `fork ... join` | 所有子執行緒結束 |
| `fork ... join_any` | 任一子執行緒結束 |
| `fork ... join_none` | 立即繼續，不等待 |

```systemverilog
initial begin
  fork
    begin #10 $display("A done"); end
    begin #20 $display("B done"); end
  join_any
  $display("one finished at %0t", $time);   // 10
  disable fork;                              // 終止剩餘執行緒
end
```

## 7.7 `event` 與同步

```systemverilog
event done;
initial begin #50 -> done; end
initial begin
  @(done);
  $display("got done at %0t", $time);
end
```

## 7.8 Timeout 保護（良好習慣）

```systemverilog
initial begin
  #1_000_000;
  $fatal(1, "Simulation timeout!");
end
```

## 7.9 Directed 與 Random 測試

- **Directed test**：手寫固定情境（例如測試邊界值），快但覆蓋有限
- **Random test**：隨機產生激勵（第 9 章），搭配覆蓋率（第 11 章）檢查完整度

## 練習

1. 為第 4 章的 `alu` 寫 testbench，用 `foreach` 窮舉 `op` 並以參考函式比對結果。
2. 為移位暫存器寫 testbench，輸入固定序列並驗證輸出。
3. 用 `fork...join_any` 實作「等待 `done` 或逾時」。

---

⬅️ [上一章：6. Interface與Modport](06_Interface與Modport) ｜ [📚 回目錄](00_目錄與學習路線) ｜ [下一章：8. 物件導向OOP](08_物件導向OOP) ➡️