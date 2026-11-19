# 第 14 章　綜合專題：UART 與學習資源

## 學習目標

- 把前面學的全部用上：FSM、計數器、同步器、testbench、自我檢查
- 理解 UART 序列通訊的運作
- 完成「發送器 + 接收器」，用**回授 (loopback)** 測試驗證
- 拿到全套語法速查表與下一步建議

> 這個專題比較長，**不要一次寫完**。照著「先規格、再畫狀態圖、再寫、再測」一步一步來。

---

## 14.1 UART 是什麼？

**UART**（Universal Asynchronous Receiver/Transmitter）是電腦、微控制器、感測器之間最常見的**序列通訊**方式（例如 USB 轉序列線、GPS 模組、藍牙模組）。

特點：

- **只用一條線傳送資料**（TX），一條線接收（RX）
- **沒有共用時脈**（非同步）：雙方事先約好傳輸速度，叫**鮑率 (baud rate)**
- 一次傳一個位元組（8 位元），一個位元接一個位元傳

### 傳輸格式：8N1

```
 線路電位
 空閒(高) ──┐      ┌──┐  ┌──┐     ┌──┐  ┌─────── 空閒(高)
            │ 起始 │D0│D1│D2 ... │D7│ 停止
            └──────┘  └──┘  └─────┘  └──┘
            ↑                                ↑
        下降緣 = 開始傳                  回到高電位
```

| 欄位 | 位元數 | 電位 | 說明 |
|------|:-----:|:----:|------|
| 空閒 | — | 高 (1) | 沒傳資料時線路是高電位 |
| **起始位 (start)** | 1 | 低 (0) | 通知接收端「要開始了」（下降緣） |
| **資料位** | 8 | D0~D7 | **低位元 (LSB) 先送** |
| **停止位 (stop)** | 1 | 高 (1) | 結束，回到空閒 |

「8N1」= 8 個資料位、無同位元 (No parity)、1 個停止位。

### 範例：傳送 `0x55`（二進位 `01010101`）

LSB 先送，所以順序是 D0=1, D1=0, D2=1, D3=0, D4=1, D5=0, D6=1, D7=0：

```
線路： 1 │ 0 │ 1 0 1 0 1 0 1 0 │ 1
       空閒 起始  D0 ... D7      停止
```

### 鮑率與每個位元的時脈數

每個位元要持續一段固定時間。用系統時脈來計算：

```
CLKS_PER_BIT = 系統時脈頻率 ÷ 鮑率
```

例：系統時脈 50 MHz、鮑率 115200 → 50,000,000 ÷ 115200 ≈ **434**（取整數）。

模擬時為了方便，我們用很小的 **`CLKS_PER_BIT = 16`**。

---

## 14.2 設計規劃

先分成兩個模組：

```
  start ─►┌─────────┐ tx                 rx ┌─────────┐──► data[7:0]
  data ──►│ uart_tx │──────► 線路 ─────────►│ uart_rx │──► valid
          └─────────┘                       └─────────┘
```

**回授測試**：把 `uart_tx` 的 `tx` 直接接到 `uart_rx` 的 `rx`，送出什麼就該收到什麼。

---

## 14.3 發送器 (TX)

### 規格

- 輸入：`start`（脈衝，通知開始傳送）、`data[7:0]`
- 輸出：`tx`（序列線）、`busy`（傳送中為 1）
- 流程：空閒 → 起始位 → 8 個資料位（LSB 先）→ 停止位 → 空閒

### 狀態圖

```
          start=1             計滿一個位元時間          8 位元都送完           計滿一個位元時間
 ┌──────┐ ───────► ┌───────┐ ─────────────► ┌───────┐ ───────────► ┌───────┐ ─────────────► ┌──────┐
 │ IDLE │          │ START │                │ DATA  │              │ STOP  │                │ IDLE │
 └──────┘          └───────┘                └───────┘              └───────┘                └──────┘
    tx=1             tx=0                 tx=資料位元(LSB先)           tx=1                     tx=1
```

每個狀態停留 `CLKS_PER_BIT` 個時脈，用 `clk_cnt` 計數；資料位用 `bit_idx` 記錄送到第幾位。

### 設計

```verilog
module uart_tx #(
  parameter CLKS_PER_BIT = 16
)(
  input  wire       clk,
  input  wire       rst_n,
  input  wire       start,        // 一個時脈寬的脈衝：開始傳送 data
  input  wire [7:0] data,
  output reg        tx,
  output wire       busy
);
  localparam [1:0] S_IDLE  = 2'd0,
                   S_START = 2'd1,
                   S_DATA  = 2'd2,
                   S_STOP  = 2'd3;

  reg [1:0]  state;
  reg [15:0] clk_cnt;
  reg [2:0]  bit_idx;
  reg [7:0]  shreg;               // 把要送的資料先存起來

  assign busy = (state != S_IDLE);

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      state   <= S_IDLE;
      tx      <= 1'b1;            // 空閒時是高電位
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
            shreg <= data;        // 記下要送的資料
            state <= S_START;
          end
        end

        S_START: begin
          tx <= 1'b0;             // 起始位
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt <= 16'd0;
            state   <= S_DATA;
          end else begin
            clk_cnt <= clk_cnt + 16'd1;
          end
        end

        S_DATA: begin
          tx <= shreg[bit_idx];   // 送出第 bit_idx 個位元（LSB 先）
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt <= 16'd0;
            if (bit_idx == 3'd7)
              state <= S_STOP;
            else
              bit_idx <= bit_idx + 3'd1;
          end else begin
            clk_cnt <= clk_cnt + 16'd1;
          end
        end

        S_STOP: begin
          tx <= 1'b1;             // 停止位
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt <= 16'd0;
            state   <= S_IDLE;
          end else begin
            clk_cnt <= clk_cnt + 16'd1;
          end
        end

        default: state <= S_IDLE;
      endcase
    end
  end
endmodule
```

### 重點解說

| 部分 | 說明 |
|------|------|
| `shreg <= data` | 開始傳送時**先存下資料**，傳送期間輸入的 `data` 就算改變也不受影響 |
| `clk_cnt` | 每個位元停留 `CLKS_PER_BIT` 個時脈，數滿換下一個位元 |
| `tx <= shreg[bit_idx]` | `bit_idx` 從 0 數到 7，所以 **LSB（D0）先送** |
| `busy` | 不在 IDLE 就是忙碌，外面看到 `busy=1` 就不要再送新資料 |
| 這是把「FSM + 計數器」放在同一個 `always` 的寫法，初學者可以先接受 |

---

## 14.4 接收器 (RX)

### 規格

- 輸入：`rx`（序列線）
- 輸出：`data[7:0]`、`valid`（收完一個位元組時，維持 1 個時脈）

### 難點：沒有共用時脈，怎麼知道何時取樣？

線路上的資料位每個持續 `CLKS_PER_BIT` 個時脈。取樣要取在**位元的正中間**（最穩定，離兩側邊緣最遠）。

```
  位元：      起始位          D0             D1
  線路：  ────┐              ┌──────────┐   ┌─────
              └──────────────┘          └───┘
                    ↑              ↑            ↑
              中間再確認      D0 取樣      D1 取樣
              （起始位）      （正中間）   （再隔一個位元時間）
```

做法：

1. 偵測到 `rx` 變低（起始位的下降緣）
2. **等半個位元時間**，到起始位的中間，再確認一次仍是低（排除雜訊）
3. 之後**每隔一整個位元時間**取樣一次 → 剛好都落在每個資料位的中間
4. 8 位元收完，等停止位，輸出 `valid`

### 兩級同步器

`rx` 來自外部，和我們的時脈**不同步**（第 13 章：跨時脈域）。所以 `rx` 要先經過兩級正反器 `rx_m`、`rx_s` 才使用。

### 設計

```verilog
module uart_rx #(
  parameter CLKS_PER_BIT = 16
)(
  input  wire       clk,
  input  wire       rst_n,
  input  wire       rx,
  output reg  [7:0] data,
  output reg        valid         // 收完一個位元組時，維持 1 個時脈
);
  localparam [1:0] S_IDLE  = 2'd0,
                   S_START = 2'd1,
                   S_DATA  = 2'd2,
                   S_STOP  = 2'd3;

  reg        rx_m, rx_s;          // 兩級同步器
  reg [1:0]  state;
  reg [15:0] clk_cnt;
  reg [2:0]  bit_idx;

  // 同步器
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      rx_m <= 1'b1;
      rx_s <= 1'b1;
    end else begin
      rx_m <= rx;
      rx_s <= rx_m;
    end
  end

  // 接收狀態機
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      state   <= S_IDLE;
      clk_cnt <= 16'd0;
      bit_idx <= 3'd0;
      data    <= 8'd0;
      valid   <= 1'b0;
    end else begin
      valid <= 1'b0;                          // 預設：valid 只維持一個時脈

      case (state)
        S_IDLE: begin
          clk_cnt <= 16'd0;
          bit_idx <= 3'd0;
          if (rx_s == 1'b0)                   // 偵測到起始位的下降
            state <= S_START;
        end

        S_START: begin                        // 等半個位元時間，到起始位中間
          if (clk_cnt == (CLKS_PER_BIT - 1) / 2) begin
            if (rx_s == 1'b0) begin           // 中間仍是低 → 確認是真的起始位
              clk_cnt <= 16'd0;
              state   <= S_DATA;
            end else begin
              state <= S_IDLE;                // 只是雜訊，放棄
            end
          end else begin
            clk_cnt <= clk_cnt + 16'd1;
          end
        end

        S_DATA: begin                         // 每隔一個位元時間，取樣一次
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt       <= 16'd0;
            data[bit_idx] <= rx_s;            // 存進第 bit_idx 位（LSB 先）
            if (bit_idx == 3'd7)
              state <= S_STOP;
            else
              bit_idx <= bit_idx + 3'd1;
          end else begin
            clk_cnt <= clk_cnt + 16'd1;
          end
        end

        S_STOP: begin
          if (clk_cnt == CLKS_PER_BIT - 1) begin
            clk_cnt <= 16'd0;
            valid   <= 1'b1;                  // 通知：收到一個位元組
            state   <= S_IDLE;
          end else begin
            clk_cnt <= clk_cnt + 16'd1;
          end
        end

        default: state <= S_IDLE;
      endcase
    end
  end
endmodule
```

### 重點解說

| 部分 | 說明 |
|------|------|
| `valid <= 1'b0;`（在 `case` 前） | 預設值；只有在 `S_STOP` 結束時被覆蓋成 1，所以只維持一個時脈 |
| `(CLKS_PER_BIT - 1) / 2` | 半個位元時間（16 → 7） |
| `data[bit_idx] <= rx_s;` | 依序填入 D0、D1…D7，與發送端 LSB 先送對應 |
| `S_STOP` 不檢查電位 | 為了簡化。延伸練習會加「停止位錯誤」偵測 |

---

## 14.5 回授 Testbench

把 TX 的輸出直接接到 RX 的輸入，送幾個位元組，確認收到的和送出的一致。

```verilog
`timescale 1ns/1ps
module tb_uart;
  parameter CPB = 16;

  reg        clk   = 1'b0;
  reg        rst_n = 1'b0;
  reg        start = 1'b0;
  reg  [7:0] tx_data = 8'h00;
  wire       line, busy, valid;
  wire [7:0] rx_data;

  uart_tx #(.CLKS_PER_BIT(CPB)) u_tx (
    .clk(clk), .rst_n(rst_n), .start(start),
    .data(tx_data), .tx(line), .busy(busy)
  );

  uart_rx #(.CLKS_PER_BIT(CPB)) u_rx (
    .clk(clk), .rst_n(rst_n), .rx(line),
    .data(rx_data), .valid(valid)
  );

  always #5 clk = ~clk;

  integer errors = 0;
  integer i;

  // 送一個位元組並檢查收到的結果
  task send_and_check;
    input [7:0] d;
    begin
      @(negedge clk);
      tx_data = d;
      start   = 1'b1;               // 一個時脈寬的 start 脈衝
      @(negedge clk);
      start   = 1'b0;

      wait (valid == 1'b1);         // 等接收端收完
      if (rx_data !== d) begin
        errors = errors + 1;
        $display("ERROR: sent %h, received %h", d, rx_data);
      end else begin
        $display("OK: sent %h, received %h", d, rx_data);
      end

      wait (busy == 1'b0);          // 等發送端完全結束
    end
  endtask

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

  // 逾時保護
  initial begin
    #5_000_000;
    $display("*** TIMEOUT ***");
    $finish;
  end
endmodule
```

### 執行

```bash
iverilog -g2005 -Wall -o uart.vvp uart_tx.v uart_rx.v tb_uart.v
vvp uart.vvp
gtkwave wave.vcd
```

### 預期輸出

```
OK: sent 55, received 55
OK: sent aa, received aa
OK: sent 00, received 00
OK: sent ff, received ff
OK: sent xx, received xx      ← 這裡是隨機值，共 10 行
...
*** UART TEST PASSED ***
```

（隨機的 10 行，每行的 `sent` 與 `received` 數值必須相同。）

每個位元組需要 10 個位元時間 = 10 × 16 = 160 個時脈（1.6 µs）。

### 🧪 在 GTKWave 觀察

加入這些訊號：`clk`、`line`、`u_tx.state`、`u_tx.bit_idx`、`u_rx.state`、`u_rx.data`、`valid`。

1. 找到 `line` 的第一個下降緣（起始位）
2. 數一數，每個位元是不是持續 16 個時脈
3. 看 `u_rx.state` 是否在起始位**中間**進入資料狀態
4. 對照 `0x55` 的位元順序（LSB 先）：`1 0 1 0 1 0 1 0`
5. 看 `valid` 在停止位結束時只出現 1 個時脈

### 如果測試失敗怎麼辦？（除錯步驟）

1. 先把 `send_and_check` 縮減成只送一筆，看波形
2. 用 `$display` 或波形確認：`line` 的起始位、資料位長度是否 = `CLKS_PER_BIT`
3. 檢查接收端：`rx_s` 的取樣點是否在位元中間
4. 檢查 LSB/MSB 順序（常見錯誤：收到的位元順序顛倒）
5. 檢查重置是否有放開
6. 一次只改一個地方，馬上重測

---

## 14.6 上板（有 FPGA 開發板的話）

1. 系統時脈 50 MHz、鮑率 115200 → `CLKS_PER_BIT = 434`
2. 把 `uart_tx` 的 `tx` 腳位接到板上的 USB-UART 接腳，PC 端用終端機（設 115200、8N1）
3. 做一個小的上層：每按一下按鍵，送出一個字元（例：`A` = `8'h41`）
4. 把 `uart_rx` 的 `data` 接到 8 顆 LED，從 PC 送字元，LED 顯示其二進位值

> 提醒：按鍵要先經過第 13 章的**同步器**和第 9 章的**邊緣偵測**才能使用。

---

## 14.7 專題延伸（難度由低到高）

1. **同位元檢查**：加入奇／偶同位位元，並在接收端輸出錯誤旗標
2. **停止位錯誤偵測 (framing error)**：停止位時若 `rx_s` 不是 1，輸出 `frame_err`
3. **接 FIFO**：在發送端前加 FIFO，連續送資料不用等 `busy`
4. **可設定鮑率**：用第 9 章的 `tick_gen` 當鮑率產生器
5. **16 倍過取樣**：業界常見做法，取樣更精準
6. **簡單的指令解譯器**：從 UART 收到字元，依字元控制 LED（`'1'` 亮、`'0'` 滅）

---

## 14.8 全部語法速查表

### 模組結構

```verilog
module name #(parameter W = 8)(
  input  wire         clk,
  input  wire [W-1:0] a,
  output reg  [W-1:0] y
);
  // 內容
endmodule
```

### 三種電路的寫法

| 電路 | 寫法 | 賦值 |
|------|------|------|
| 簡單組合 | `assign y = a & b;` | `assign`（左邊是 `wire`） |
| 複雜組合 | `always @(*) begin ... end` | `=`（左邊是 `reg`，**要給預設值**） |
| 時序 | `always @(posedge clk or negedge rst_n) begin ... end` | `<=`（要有重置） |

### 運算子

| 類別 | 運算子 |
|------|--------|
| 算術 | `+ - * / %` |
| 比較 | `< <= > >= == !=` |
| 位元 | `& \| ^ ~` |
| 邏輯 | `&& \|\| !`（用於條件） |
| 縮減 | `&a \|a ^a` |
| 移位 | `<< >>` |
| 連接／複製 | `{a, b}`、`{4{1'b1}}` |
| 條件 | `c ? x : y` |

### 數字格式

`位元數'進位值`：`4'b1010`、`8'hFF`、`8'd100`

### Testbench 常用

```verilog
`timescale 1ns/1ps
reg clk = 0;  always #5 clk = ~clk;
initial begin  ...  #10;  @(negedge clk);  repeat (n) @(posedge clk);  $finish;  end
$display("t=%0d x=%b", $time, x);
$dumpfile("wave.vcd");  $dumpvars(0, tb);
```

### 指令

```bash
iverilog -g2005 -Wall -o sim.vvp a.v b.v tb.v
vvp sim.vvp
gtkwave wave.vcd
verilator --lint-only -Wall a.v
yosys -p "read_verilog a.v; synth -top a; stat"
```

---

## 14.9 各章重點回顧

| 章 | 一句話重點 |
|----|-----------|
| 1 | 硬體是同時運作的；組合無記憶、時序有記憶 |
| 2 | `iverilog` 編譯 → `vvp` 執行 → `gtkwave` 看波形 |
| 3 | `module`、`assign`、testbench 的基本結構 |
| 4 | `wire` 用 `assign`、`reg` 用 `always`；`[7:0]` 與 `8'hFF` |
| 5 | 資料用 `& \| ~`，條件用 `&& \|\| !`；結果放不下會截斷 |
| 6 | 組合 `always @(*)` + `=` + 預設值，避免 latch |
| 7 | 規格 → 設計 → 驗證；自我檢查的 testbench |
| 8 | 時序 `<=`；非同步重置；時序沒寫 else = 保持 |
| 9 | 用使能脈衝取代自製時脈 |
| 10 | FSM 三段式；先畫狀態圖 |
| 11 | 參考模型 + 比對 + PASSED/FAILED；突變測試 |
| 12 | 小模組組合成大系統；參數化、generate |
| 13 | RTL 只用可合成語法；lint 與 Yosys 再檢查一遍 |
| 14 | UART：用 FSM + 計數器 + 同步器完成真實通訊 |

## 14.10 常見錯誤總清單

1. 時序用 `=`、組合用 `<=`
2. 組合邏輯沒給預設值 → latch
3. 敏感列表手寫漏掉訊號（改用 `@(*)`）
4. 同一個 `reg` 在兩個 `always` 裡賦值
5. 位元寬度不一致造成截斷
6. 用 `==` 比對（`x` 會被漏掉），應用 `!==`（僅 testbench）
7. 重置極性寫反
8. 多位元訊號逐位元同步
9. RTL 裡放 `#` 延遲或 `$display`
10. testbench 沒有逾時保護、沒有 PASSED/FAILED
11. 在 testbench 的時脈上升緣改輸入
12. 用計數器做新時脈（改用使能脈衝）
13. 編譯時漏了某個 `.v` 檔案

## 14.11 延伸學習資源

**書籍**

- *Digital Design and Computer Architecture* — Harris & Harris（內含大量 Verilog 範例）
- *Verilog HDL: A Guide to Digital Design and Synthesis* — Samir Palnitkar
- Clifford Cummings 的 SNUG 論文（阻塞／非阻塞、FSM、同步重置等經典主題）

**線上資源**

- **HDLBits**：線上練習題，即時判分，適合刷基本功
- Icarus Verilog、Verilator、Yosys 的官方文件
- Nandland、ZipCPU 部落格（FPGA 實作與開源硬體設計）

**進一步主題**

1. 非同步 FIFO 與完整的跨時脈域設計
2. FPGA 實作流程（腳位約束、佈局佈線、時序報告）
3. 形式驗證（開源工具 SymbiYosys）
4. 簡易 CPU 設計（RISC-V 子集），是檢驗 RTL 功力的好專題
5. **SystemVerilog**（見下）

## 14.12 下一步：SystemVerilog

學好 Verilog 之後，遷移到 SystemVerilog 非常容易，核心硬體觀念完全相同：

| Verilog | SystemVerilog |
|---------|---------------|
| `wire` / `reg` | `logic`（多數情況通用） |
| `always @(*)` | `always_comb` |
| `always @(posedge clk)` | `always_ff @(posedge clk)` |
| `localparam` 狀態常數 | `typedef enum` |
| 手寫 testbench、`$random` | `class`、`rand`、`constraint` |
| 手動比對輸出 | assertions (SVA)、功能覆蓋率 |
| 自建驗證架構 | UVM |

開源工具對**可合成的設計語法**（`logic`、`always_ff`、`always_comb`）支援度較好；進階的驗證功能（class、約束隨機化、完整 SVA、UVM）則主要依賴商用模擬器，這點在規劃學習路徑時可以參考。

---

## 結語

完成這份講義後，你應該能夠：

- 看懂並寫出**組合與時序**電路
- 用**狀態機**描述有流程的行為
- 寫**自我檢查的 testbench**
- 用工具檢查**可合成**的設計
- 完成一個**真實通訊協定**的設計

接下來最好的練習就是**自己挑一個小專題從頭做到尾**：SPI 主控器、I²C、PWM 控制器、VGA 控制器、簡易 CPU。流程永遠是：**寫規格 → 畫狀態圖／時序圖 → 寫 RTL → 寫 testbench → lint → 合成 → （有板子就）上板**。

遇到卡關，回到本講義的「常見錯誤」表，大部分問題都在裡面。祝學習順利！

---

⬅️ [上一章：13. 可合成與工程實務](V13_可合成與工程實務) ｜ [📚 回目錄](V00_目錄與學習地圖)