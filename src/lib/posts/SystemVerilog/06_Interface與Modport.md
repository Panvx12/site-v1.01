# 第 6 章　Interface 與 Modport

## 6.1 為什麼需要 interface？

傳統模組連接需要逐一列出大量訊號，容易漏接或接錯。`interface` 把一組相關訊號**打包成一個物件**，只需連接一次。

## 6.2 基本 interface

```systemverilog
interface bus_if (input logic clk);
  logic        valid;
  logic        ready;
  logic [31:0] data;
endinterface
```

使用：

```systemverilog
module producer (bus_if bus);
  always_ff @(posedge bus.clk) begin
    bus.valid <= 1'b1;
    bus.data  <= $urandom();
  end
endmodule

module consumer (bus_if bus);
  assign bus.ready = 1'b1;
endmodule

module top;
  logic clk = 0;
  always #5 clk = ~clk;

  bus_if bus (clk);
  producer p (.bus(bus));
  consumer c (.bus(bus));
endmodule
```

## 6.3 `modport`：規範方向

`modport` 定義從某一方看到的訊號方向，避免誤接。

```systemverilog
interface bus_if (input logic clk);
  logic        valid, ready;
  logic [31:0] data;

  modport master (output valid, data, input  ready, clk);
  modport slave  (input  valid, data, output ready, input clk);
endinterface

module producer (bus_if.master bus);
  // 嘗試驅動 bus.ready 會被編譯器視為錯誤
endmodule

module consumer (bus_if.slave bus);
endmodule
```

## 6.4 Interface 中的 task / function

```systemverilog
interface bus_if (input logic clk);
  logic        valid, ready;
  logic [31:0] data;

  task automatic send(input logic [31:0] d);
    @(posedge clk);
    valid <= 1'b1;
    data  <= d;
    do @(posedge clk); while (!ready);
    valid <= 1'b0;
  endtask
endinterface
```

## 6.5 Clocking Block

解決 testbench 與 DUT 之間的**時序競爭**：把取樣與驅動對齊到時脈邊緣並加上偏移。

```systemverilog
interface bus_if (input logic clk);
  logic        valid, ready;
  logic [31:0] data;

  clocking cb @(posedge clk);
    default input #1step output #1;
    output valid, data;
    input  ready;
  endclocking

  modport tb (clocking cb, input clk);
endinterface
```

在 testbench 中：

```systemverilog
// 驅動：以 <= 搭配 clocking block
vif.cb.valid <= 1'b1;
@(vif.cb);                 // 等一個時脈
// 取樣
if (vif.cb.ready) ...
```

- `input #1step`：在時脈邊緣之前的最後一刻取樣（取得「舊值」）
- `output #1`：時脈邊緣後 1 個時間單位驅動

## 6.6 Virtual Interface

`class` 中不能直接宣告 interface 實例，要用 `virtual interface` 作為**句柄**指向實際 interface，這是連接「靜態硬體世界」與「動態物件世界」的橋樑（第 8、12 章會大量使用）。

```systemverilog
class driver;
  virtual bus_if vif;

  function new(virtual bus_if vif);
    this.vif = vif;
  endfunction

  task run();
    vif.send(32'hDEADBEEF);
  endtask
endclass

module tb;
  logic clk = 0;
  always #5 clk = ~clk;
  bus_if bus (clk);

  initial begin
    driver d = new(bus);
    d.run();
    $finish;
  end
endmodule
```

## 練習

1. 為簡單的 SRAM（`addr`、`wdata`、`rdata`、`we`、`en`）設計 interface，含 `master`/`slave` modport。
2. 在 interface 中加入 `write` 與 `read` task，在 testbench 中呼叫。
3. 為 interface 加入 clocking block，比較「有」與「沒有」時的取樣差異。

---

⬅️ [上一章：5. 時序邏輯與FSM](05_時序邏輯與FSM) ｜ [📚 回目錄](00_目錄與學習路線) ｜ [下一章：7. Testbench基礎](07_Testbench基礎) ➡️
