# 第 11 章　綜合專題：UART 與學習資源

## 11.1 專題目標

設計一組 **UART（非同步串列通訊）**收發器，並用 testbench 做回授 (loopback) 驗證。這個專題會用到前面所有章節的內容：FSM、計數器、同步器、testbench、自我檢查。

### UART 傳輸格式（8N1）

```
空閒(高) ─┐ ┌─D0─D1─D2─D3─D4─D5─D6─D7─┐ ┌─ 空閒(高)
          └─┘ START              STOP └─┘
```

- 空閒時線路為高電位
- 起始位 (start)：1 個位元，低電位
- 資料位：8 位元，**LSB 先傳**
- 停止位 (stop)：1 個位元，高電位
- 每位元持續 `CLKS_PER_BIT` 個系統時脈週期（`CLKS_PER_BIT = 系統時脈頻率 / 鮑率`，例如 50 MHz / 115200 ≈ 434）

## 11.2 發送器 (TX)

```verilog
module uart_tx #(
  parameter CLKS_PER_BIT = 16
)(
  input  wire       clk,
  input  wire       rst_n,
  input  wire       start,        // 脈衝：開始傳送 data
  input  wire [7:0] data,
  output reg        tx,
  output wire       busy
);
  localparam [1:0] S_IDLE = 2'd0,
                   S_START = 2'd1,
                   S_DATA = 2'd2,
                   S_STOP = 2'd3;

  reg [1:0]  state;
  reg [15:0] clk_cnt;
  reg [2:0]  bit_idx;
  reg [7:0]  shreg;

  assign busy = (state != S_IDLE);

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      state   <= S_IDLE;
      tx      <= 1'b1;
      clk_cnt <= 16'd0;
      bit_idx <= 3'd0;
      shreg   <= 8'd0;
    end else begin
      case (state)
        S_IDLE: begin
          tx      <= 1'b1;
          clk_cnt <= 16'd0;
          bit_idx <= 3'd0;
          if (start) begin
            shreg <= data;
            state <= S_START;
          end
        end

        S_START: begin
          tx <= 1'b0;
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt <= 16'd0;
            state   <= S_DATA;
          end else clk_cnt <= clk_cnt + 1'b1;
        end

        S_DATA: begin
          tx <= shreg[bit_idx];
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt <= 16'd0;
            if (bit_idx == 3'd7) state <= S_STOP;
            else                 bit_idx <= bit_idx + 1'b1;
          end else clk_cnt <= clk_cnt + 1'b1;
        end

        S_STOP: begin
          tx <= 1'b1;
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt <= 16'd0;
            state   <= S_IDLE;
          end else clk_cnt <= clk_cnt + 1'b1;
        end

        default: state <= S_IDLE;
      endcase
    end
  end
endmodule
```

## 11.3 接收器 (RX)

重點：

1. 輸入先經兩級同步器（RX 線與系統時脈不同步）
2. 偵測到起始位後，等**半個位元時間**到起始位中央再確認
3. 之後每隔一整個位元時間取樣一次（落在每位元中央，最穩定）

```verilog
module uart_rx #(
  parameter CLKS_PER_BIT = 16
)(
  input  wire       clk,
  input  wire       rst_n,
  input  wire       rx,
  output reg  [7:0] data,
  output reg        valid          // 收到一個位元組時，維持 1 個週期
);
  localparam [1:0] S_IDLE = 2'd0,
                   S_START = 2'd1,
                   S_DATA = 2'd2,
                   S_STOP = 2'd3;

  reg        rx_m, rx_s;           // 同步器
  reg [1:0]  state;
  reg [15:0] clk_cnt;
  reg [2:0]  bit_idx;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      rx_m <= 1'b1;
      rx_s <= 1'b1;
    end else begin
      rx_m <= rx;
      rx_s <= rx_m;
    end
  end

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      state   <= S_IDLE;
      clk_cnt <= 16'd0;
      bit_idx <= 3'd0;
      data    <= 8'd0;
      valid   <= 1'b0;
    end else begin
      valid <= 1'b0;                       // 預設：脈衝只維持一個週期
      case (state)
        S_IDLE: begin
          clk_cnt <= 16'd0;
          bit_idx <= 3'd0;
          if (rx_s == 1'b0) state <= S_START;
        end

        S_START: begin                     // 等到起始位中央再確認
          if (clk_cnt == (CLKS_PER_BIT - 1) / 2) begin
            if (rx_s == 1'b0) begin
              clk_cnt <= 16'd0;
              state   <= S_DATA;
            end else state <= S_IDLE;      // 只是雜訊，放棄
          end else clk_cnt <= clk_cnt + 1'b1;
        end

        S_DATA: begin                      // 每隔一個位元時間，取樣位元中央
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt        <= 16'd0;
            data[bit_idx]  <= rx_s;
            if (bit_idx == 3'd7) state <= S_STOP;
            else                 bit_idx <= bit_idx + 1'b1;
          end else clk_cnt <= clk_cnt + 1'b1;
        end

        S_STOP: begin
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt <= 16'd0;
            valid   <= 1'b1;
            state   <= S_IDLE;
          end else clk_cnt <= clk_cnt + 1'b1;
        end

        default: state <= S_IDLE;
      endcase
    end
  end
endmodule
```

## 11.4 回授 Testbench

```verilog
`timescale 1ns/1ps
module tb_uart;
  parameter CPB = 16;

  reg        clk = 1'b0;
  reg        rst_n = 1'b0;
  reg        start = 1'b0;
  reg  [7:0] tx_data = 8'h00;
  wire       line, busy, valid;
  wire [7:0] rx_data;

  uart_tx #(.CLKS_PER_BIT(CPB)) u_tx (
    .clk(clk), .rst_n(rst_n), .start(start),
    .data(tx_data), .tx(line), .busy(busy));

  uart_rx #(.CLKS_PER_BIT(CPB)) u_rx (
    .clk(clk), .rst_n(rst_n), .rx(line),
    .data(rx_data), .valid(valid));

  always #5 clk = ~clk;

  integer errors = 0;

  task send_and_check;
    input [7:0] d;
    begin
      @(negedge clk);
      tx_data = d;
      start   = 1'b1;
      @(negedge clk);
      start   = 1'b0;

      wait (valid == 1'b1);                // 等接收完成
      if (rx_data !== d) begin
        errors = errors + 1;
        $display("[%0t] ERROR: sent %h, received %h", $time, d, rx_data);
      end else
        $display("[%0t] OK: %h", $time, d);

      wait (busy == 1'b0);                 // 等發送完全結束
    end
  endtask

  integer i;

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, tb_uart);

    #33 rst_n = 1'b1;
    repeat (5) @(posedge clk);

    send_and_check(8'h55);
    send_and_check(8'hAA);
    send_and_check(8'h00);
    send_and_check(8'hFF);
    for (i = 0; i < 10; i = i + 1)
      send_and_check($random);

    if (errors == 0) $display("*** UART TEST PASSED ***");
    else             $display("*** UART TEST FAILED: %0d errors ***", errors);
    $finish;
  end

  initial begin
    #5_000_000;
    $display("*** TIMEOUT ***");
    $finish;
  end
endmodule
```

執行：

```bash
iverilog -g2005 -Wall -o uart.vvp uart_tx.v uart_rx.v tb_uart.v
vvp uart.vvp
gtkwave wave.vcd
```

在 GTKWave 中加入 `line`、`u_tx.state`、`u_rx.state`，觀察起始位、資料位與取樣時間點。

## 11.5 專題延伸

1. 加入**同位元檢查**（奇/偶）與錯誤旗標
2. 偵測**停止位錯誤 (framing error)**
3. 加入 TX / RX 的 **FIFO 緩衝**（使用第 8 章的 `sync_fifo`）
4. 加入可設定的**鮑率產生器**（使用 `tick_gen`，並以 16 倍過取樣取代本例的計數方式）
5. 用 Yosys 合成並以 `stat` 看資源用量；若有 FPGA 開發板，接上 USB-UART 實際測試

## 11.6 各章重點速查

| 章 | 一句話重點 |
|----|-----------|
| 1 | Verilog 是「描述硬體」，不是寫程式；先會模擬再說 |
| 2 | wire 用 `assign`，reg 用 `always`；注意位元寬度 |
| 3 | 具名連接、`parameter`、`generate`；用 `u_` 命名實例 |
| 4 | `always @(*)` + `=` + 預設值，避免 latch |
| 5 | `always @(posedge clk)` + `<=`；一個 reg 一處驅動 |
| 6 | FSM 用三段式；狀態圖先於程式碼 |
| 7 | Testbench 要自我檢查、有逾時保護、結尾印 PASS/FAIL |
| 8 | 用使能脈衝取代自製時脈；多位元跨時脈域用格雷碼或握手 |
| 9 | RTL 只用可合成子集；管線化改善時序 |
| 10 | iverilog + GTKWave + Verilator lint + Yosys，Makefile 串起來 |
| 11 | 以 UART 把 FSM、計數器、同步器、驗證整合起來 |

## 11.7 常見錯誤清單

1. 時序 always 用 `=`、組合 always 用 `<=`
2. 組合邏輯忘記預設值 → latch
3. 敏感列表漏寫（改用 `@(*)`）
4. 同一個 reg 在兩個 always 中賦值
5. 位元寬度不一致導致截斷或擴展錯誤
6. 比較含 X 的值時用 `==`（應使用 `===`/`!==`，僅限 testbench）
7. 重置極性與訊號不一致
8. 把多位元訊號逐位元同步
9. RTL 中使用 `#` 延遲或 `$display`
10. Testbench 沒有逾時保護，卡死不結束

## 11.8 Verilog 與 SystemVerilog 對照

之後想學 SystemVerilog 時，這張表可以幫助遷移：

| Verilog | SystemVerilog |
|---------|---------------|
| `wire` / `reg` | `logic`（多數情況通用） |
| `always @(*)` | `always_comb` |
| `always @(posedge clk)` | `always_ff @(posedge clk)` |
| `localparam` 狀態常數 | `typedef enum` |
| 多個零散訊號 | `struct packed`、`interface` |
| `` `define `` 常數 | `package` + `parameter` |
| 手寫 testbench、`$random` | `class`、`rand`、`constraint` |
| 手動比對輸出 | assertions (SVA)、功能覆蓋率 |
| 自建驗證架構 | UVM |

兩者的核心硬體觀念（並行、時序、非阻塞賦值、FSM、可合成寫法）完全相同，學好 Verilog 後遷移成本很低。

## 11.9 延伸學習資源

**書籍**

- *Verilog HDL: A Guide to Digital Design and Synthesis* — Samir Palnitkar
- *Digital Design and Computer Architecture* — Harris & Harris（內含 Verilog 實作範例）
- *RTL Modeling with SystemVerilog for Simulation and Synthesis* — Stuart Sutherland（對照 Verilog 與 SV 的最佳實務）
- Clifford Cummings 的 SNUG 論文（阻塞/非阻塞、FSM、同步重置等主題的經典文章）

**線上資源**

- HDLBits（線上練習題，即時判題，適合刷基本功）
- Icarus Verilog、Verilator、Yosys、cocotb 的官方文件
- ZipCPU 部落格（開源硬體設計與形式驗證的實戰文章）
- Nandland（以 FPGA 為主的入門教學）

**進一步主題**

- 形式驗證（以開源工具 SymbiYosys 為例）
- 非同步 FIFO 與完整的 CDC 設計
- FPGA 實作流程（約束檔、佈局佈線、時序報告）
- 簡易 CPU 設計（如 RISC-V 子集），是檢驗 RTL 功力的好專題
- SystemVerilog 的可合成設計語法

---

完成本講義後，建議挑一個完整的小 IP（SPI 主控器、I²C、簡易 CPU、VGA 控制器）從頭到尾自己做一遍：寫規格 → RTL → testbench → lint → 合成 → （有板子就）上板驗證。
