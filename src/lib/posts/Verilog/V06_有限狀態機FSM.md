# 第 6 章　有限狀態機 (FSM)

## 6.1 基本概念

FSM 由三部分組成：

1. **狀態暫存器**：記錄目前狀態（時序）
2. **下一狀態邏輯**：由目前狀態與輸入決定下一狀態（組合）
3. **輸出邏輯**：由狀態（與輸入）決定輸出（組合）

| 類型 | 輸出取決於 | 特點 |
|------|-----------|------|
| **Moore** | 只有目前狀態 | 輸出穩定、較不易毛刺、反應慢一拍 |
| **Mealy** | 狀態與輸入 | 狀態數較少、反應快一拍、輸出可能有毛刺 |

## 6.2 狀態編碼

Verilog-2001 沒有 `enum`，一般用 `localparam` 定義狀態。

```verilog
localparam [1:0] S_IDLE = 2'd0,
                 S_RUN  = 2'd1,
                 S_DONE = 2'd2;

reg [1:0] state, next;
```

| 編碼方式 | 說明 | 適用 |
|----------|------|------|
| 二進位 (binary) | 狀態數 N 需 log2(N) 個正反器 | 面積敏感 |
| 獨熱碼 (one-hot) | 每狀態 1 個正反器，N 個 | FPGA 常用，速度快、解碼簡單 |
| Gray | 相鄰狀態只差 1 位元 | 低功耗、跨時脈域 |

## 6.3 三段式寫法（推薦）

### 範例：序列偵測器，偵測 `101`（重疊式，Moore）

```verilog
module seq_detect_101 (
  input  wire clk,
  input  wire rst_n,
  input  wire din,
  output reg  found
);
  localparam [1:0] S0   = 2'd0,   // 尚未開始
                   S1   = 2'd1,   // 已收到 1
                   S10  = 2'd2,   // 已收到 10
                   S101 = 2'd3;   // 已收到 101

  reg [1:0] state, next;

  // 1. 狀態暫存器（時序）
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) state <= S0;
    else        state <= next;
  end

  // 2. 下一狀態邏輯（組合）
  always @(*) begin
    next = state;                         // 預設：保持
    case (state)
      S0:      next = din ? S1   : S0;
      S1:      next = din ? S1   : S10;
      S10:     next = din ? S101 : S0;
      S101:    next = din ? S1   : S10;   // 重疊：最後的 1 可當下一個序列的開頭
      default: next = S0;
    endcase
  end

  // 3. 輸出邏輯（Moore：只看 state）
  always @(*) begin
    found = (state == S101);
  end
endmodule
```

### 對應的 Testbench

```verilog
`timescale 1ns/1ps
module tb_seq;
  reg clk = 0, rst_n = 0, din = 0;
  wire found;

  seq_detect_101 dut (.clk(clk), .rst_n(rst_n), .din(din), .found(found));
  always #5 clk = ~clk;

  reg [15:0] pattern = 16'b0010_1101_0101_1001;
  integer i;

  initial begin
    $dumpfile("wave.vcd"); $dumpvars(0, tb_seq);
    #22 rst_n = 1;
    for (i = 15; i >= 0; i = i - 1) begin
      @(negedge clk);
      din = pattern[i];
    end
    #20 $finish;
  end

  always @(posedge clk)
    if (found) $display("[%0t] found 101", $time);
endmodule
```

## 6.4 Mealy 版本（輸出與輸入有關）

```verilog
module seq_detect_101_mealy (
  input  wire clk, rst_n, din,
  output wire found
);
  localparam [1:0] S0 = 2'd0, S1 = 2'd1, S10 = 2'd2;
  reg [1:0] state, next;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) state <= S0;
    else        state <= next;
  end

  always @(*) begin
    next = state;
    case (state)
      S0:      next = din ? S1  : S0;
      S1:      next = din ? S1  : S10;
      S10:     next = din ? S1  : S0;    // 偵測到 101 後，最後的 1 當新的開頭
      default: next = S0;
    endcase
  end

  assign found = (state == S10) && din;  // Mealy：輸出含輸入
endmodule
```

只需 3 個狀態，但輸出會隨輸入 `din` 即時變化。

## 6.5 範例：紅綠燈控制器

```verilog
module traffic (
  input  wire clk, rst_n,
  output reg  red, yellow, green
);
  localparam [1:0] S_RED = 2'd0, S_GREEN = 2'd1, S_YELLOW = 2'd2;
  localparam RED_T = 10, GREEN_T = 8, YELLOW_T = 3;     // 單位：時脈週期

  reg [1:0] state, next;
  reg [3:0] timer;

  wire done = (state == S_RED    && timer == RED_T    - 1) ||
              (state == S_GREEN  && timer == GREEN_T  - 1) ||
              (state == S_YELLOW && timer == YELLOW_T - 1);

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      state <= S_RED;
      timer <= 4'd0;
    end else begin
      state <= next;
      timer <= (state != next) ? 4'd0 : timer + 1'b1;
    end
  end

  always @(*) begin
    next = state;
    case (state)
      S_RED:    if (done) next = S_GREEN;
      S_GREEN:  if (done) next = S_YELLOW;
      S_YELLOW: if (done) next = S_RED;
      default:  next = S_RED;
    endcase
  end

  always @(*) begin
    red = 1'b0; yellow = 1'b0; green = 1'b0;
    case (state)
      S_RED:    red    = 1'b1;
      S_GREEN:  green  = 1'b1;
      S_YELLOW: yellow = 1'b1;
      default:  red    = 1'b1;
    endcase
  end
endmodule
```

## 6.6 獨熱碼 FSM 的寫法

```verilog
localparam IDLE = 0, RUN = 1, DONE = 2;      // 這裡是「位元索引」
reg [2:0] state, next;

always @(*) begin
  next = 3'b000;
  case (1'b1)                                // 以 1'b1 對比每一位元
    state[IDLE]: next[start ? RUN : IDLE] = 1'b1;
    state[RUN]:  next[finish ? DONE : RUN] = 1'b1;
    state[DONE]: next[IDLE] = 1'b1;
    default:     next[IDLE] = 1'b1;
  endcase
end
```

重置時要把 `state` 設成 `3'b001`（IDLE 位元為 1）。

## 6.7 設計 FSM 的步驟

1. 先畫**狀態圖**或寫狀態轉移表
2. 決定 Moore 或 Mealy
3. 決定狀態編碼
4. 寫三段式程式
5. 寫 testbench 覆蓋**每一條狀態轉移**
6. 檢查是否有「死狀態」與不可到達狀態，`default` 要回到安全狀態

## 6.8 常見陷阱

⚠️ 忘記在 `next` 邏輯開頭給預設值 `next = state;` → latch
⚠️ 輸出直接寫在狀態暫存器區塊中，卻想要組合輸出，造成延遲一拍
⚠️ 狀態寬度不夠，狀態值被截斷
⚠️ 沒有 `default`，遇到非法狀態值（如受輻射影響翻轉）時無法恢復

## 練習

1. 實作**非重疊式**的 `101` 序列偵測器。
2. 設計自動販賣機：接受 5、10 元，累計 15 元出貨，超過找零。先畫狀態圖。
3. 為 `traffic` 寫 testbench，驗證三個燈號持續時間符合規格。
4. 把 `seq_detect_101` 改寫成獨熱碼版本。
