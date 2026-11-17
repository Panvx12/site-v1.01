# 第 7 章　Testbench 撰寫

## 7.1 Testbench 是什麼？

Testbench 是**不可合成、僅供模擬**的程式，用來產生激勵並檢查 DUT（Design Under Test，待測設計）的行為。

```
 ┌───────────────── Testbench ─────────────────┐
 │  激勵產生  →  [  DUT  ]  →  輸出檢查          │
 │  時脈 / 重置                                  │
 └─────────────────────────────────────────────┘
```

特點：

- 沒有輸入輸出埠
- 驅動 DUT 輸入的訊號宣告為 `reg`，觀察 DUT 輸出的訊號宣告為 `wire`

## 7.2 `initial` 與 `always`

```verilog
module tb;
  reg clk = 1'b0;
  reg rst_n;

  always #5 clk = ~clk;          // 週期 10 的時脈

  initial begin
    rst_n = 1'b0;
    #20 rst_n = 1'b1;
  end
endmodule
```

- `initial`：模擬開始時執行一次
- `always`：重複執行（沒有敏感列表要加延遲，否則會造成無限迴圈）

## 7.3 時間控制

| 語法 | 意義 |
|------|------|
| `#10` | 延遲 10 個時間單位 |
| `@(posedge clk)` | 等待事件 |
| `wait (cond)` | 等待條件成立（位準觸發） |
| `repeat (n) @(posedge clk)` | 等 n 個時脈 |

## 7.4 控制結構

```verilog
integer i;
initial begin
  for (i = 0; i < 8; i = i + 1) begin ... end
  repeat (10) begin ... end
  while (cond) begin ... end
  forever begin ... end          // 搭配 disable 或 $finish
end
```

## 7.5 Task 與 Function

```verilog
// function：不耗時、有回傳值
function [7:0] ref_add;
  input [7:0] a, b;
  begin
    ref_add = a + b;
  end
endfunction

// task：可耗時
task wait_cycles;
  input integer n;
  begin
    repeat (n) @(posedge clk);
  end
endtask
```

在 Verilog-2001 可加 `automatic` 讓每次呼叫擁有獨立變數（適用於遞迴與並行呼叫）：

```verilog
task automatic send_byte;
  input [7:0] d;
  begin ... end
endtask
```

## 7.6 完整範例：計數器 Testbench（自我檢查）

DUT 使用第 5 章的 `counter`。

```verilog
`timescale 1ns/1ps
module tb_counter;
  parameter W = 4;

  reg          clk = 1'b0;
  reg          rst_n, en;
  wire [W-1:0] cnt;

  counter #(.W(W)) dut (.clk(clk), .rst_n(rst_n), .en(en), .cnt(cnt));

  always #5 clk = ~clk;

  // 參考模型
  reg [W-1:0] expected;
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)   expected <= {W{1'b0}};
    else if (en)  expected <= expected + 1'b1;
  end

  // 檢查：在時脈下降緣比對，避開競爭
  integer errors = 0;
  always @(negedge clk) begin
    if (rst_n && (cnt !== expected)) begin
      $display("[%0t] ERROR: cnt=%0d expected=%0d", $time, cnt, expected);
      errors = errors + 1;
    end
  end

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, tb_counter);

    rst_n = 1'b0; en = 1'b0;
    repeat (3) @(posedge clk);
    #1 rst_n = 1'b1;

    @(negedge clk) en = 1'b1;
    repeat (20) @(posedge clk);
    @(negedge clk) en = 1'b0;
    repeat (3)  @(posedge clk);
    @(negedge clk) en = 1'b1;
    repeat (10) @(posedge clk);

    if (errors == 0) $display("*** TEST PASSED ***");
    else             $display("*** TEST FAILED: %0d errors ***", errors);
    $finish;
  end

  // 逾時保護
  initial begin
    #100000;
    $display("*** TIMEOUT ***");
    $finish;
  end
endmodule
```

重點：

- 激勵放在**時脈下降緣**驅動，避免與 DUT 的上升緣取樣產生競爭
- 用 `!==` 比較，才能偵測 X/Z
- 一定要有「PASSED/FAILED」總結與逾時保護

## 7.6.1 窮舉測試：ALU

```verilog
`timescale 1ns/1ps
module tb_alu;
  reg  [7:0] a, b;
  reg  [2:0] op;
  wire [7:0] y;
  wire       zero;

  alu dut (.a(a), .b(b), .op(op), .y(y), .zero(zero));

  integer i, j, k, errors;
  reg [7:0] exp;

  initial begin
    errors = 0;
    for (k = 0; k < 7; k = k + 1) begin
      for (i = 0; i < 256; i = i + 17) begin
        for (j = 0; j < 256; j = j + 13) begin
          a = i[7:0]; b = j[7:0]; op = k[2:0];
          #1;
          case (op)
            3'd0: exp = a + b;
            3'd1: exp = a - b;
            3'd2: exp = a & b;
            3'd3: exp = a | b;
            3'd4: exp = a ^ b;
            3'd5: exp = a << 1;
            3'd6: exp = a >> 1;
            default: exp = 8'h00;
          endcase
          if (y !== exp || zero !== (exp == 8'h00)) begin
            errors = errors + 1;
            $display("ERR op=%0d a=%h b=%h y=%h exp=%h", op, a, b, y, exp);
          end
        end
      end
    end
    if (errors == 0) $display("ALU PASSED"); else $display("ALU FAILED: %0d", errors);
    $finish;
  end
endmodule
```

## 7.7 隨機激勵

```verilog
reg [7:0] r;
integer seed = 1;

initial begin
  repeat (100) begin
    r = $random(seed);              // 帶種子，結果可重現
    // 或 r = $random; 也行
    a = {$random} % 256;            // 加大括號得到無號數
    #10;
  end
end
```

⚠️ Verilog 的 `$random` 只能做簡單隨機；真正「受約束的隨機」屬於 SystemVerilog 的功能。

## 7.8 輸出與除錯

```verilog
$display("t=%0t a=%b y=%h", $time, a, y);
$monitor("t=%0t cnt=%d", $time, cnt);     // 訊號變化時自動印出
$strobe("...");                            // 當前時間步結束時印出
```

### 波形輸出

```verilog
initial begin
  $dumpfile("wave.vcd");
  $dumpvars(0, tb);     // 0 = 全階層；1 = 僅該層
end
```

## 7.9 檔案 I/O 與記憶體初始化

```verilog
integer fd;
reg [7:0] mem [0:255];

initial begin
  $readmemh("init.hex", mem);         // 每行一個十六進位值
  fd = $fopen("result.log", "w");
  $fdisplay(fd, "cnt=%0d", cnt);
  $fclose(fd);
end
```

`init.hex` 範例：

```
AA
BB
// 註解可以放這裡
CC
```

## 7.10 命令列參數

```verilog
integer n;
initial begin
  if ($value$plusargs("N=%d", n)) $display("N=%0d", n);
  if ($test$plusargs("VERBOSE"))  $display("verbose on");
end
```

```bash
vvp sim.vvp +N=100 +VERBOSE
```

## 7.11 並行與同步：`fork` / `event`

```verilog
event done;

initial begin
  fork
    begin #10 $display("A"); end
    begin #20 $display("B"); end
  join                         // 等全部完成
  -> done;
end

initial begin
  @(done);
  $display("done at %0t", $time);
end
```

## 7.12 好 Testbench 的準則

1. **自我檢查**：不依賴人眼看波形
2. **可重現**：隨機要有種子
3. **覆蓋完整**：正常、邊界、錯誤情境
4. **有逾時保護**
5. **結尾明確印出 PASS / FAIL**
6. 激勵避開時脈邊緣

## 練習

1. 為第 5 章的 `shift_reg` 寫 testbench，輸入固定序列，並用 reference 比對輸出。
2. 為第 6 章 `seq_detect_101` 寫自我檢查 testbench：用「軟體模型」計算預期 `found`。
3. 用 `$readmemh` 載入 16 筆測試向量，餵給 `alu` 並檢查。
4. 在 testbench 加入 `+SEED=` 參數，讓隨機測試可重現。
