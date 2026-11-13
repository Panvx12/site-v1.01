# 第 12 章　進階 Testbench 與 UVM 簡介

## 12.1 執行緒間通訊

### `mailbox`：傳遞資料

```systemverilog
mailbox #(Transaction) mbx = new();   // 無界；new(4) 為容量 4

// 生產者
task automatic gen();
  Transaction t;
  repeat (5) begin
    t = new();
    void'(t.randomize());
    mbx.put(t);          // 滿了會阻塞
  end
endtask

// 消費者
task automatic drv();
  Transaction t;
  forever begin
    mbx.get(t);          // 空了會阻塞
    t.print("drv");
  end
endtask
```

方法：`put`、`get`、`try_put`、`try_get`、`peek`、`num`。

### `semaphore`：共用資源互斥

```systemverilog
semaphore bus_lock = new(1);   // 1 把鑰匙

task automatic use_bus(string who);
  bus_lock.get();
  $display("%s got bus", who);
  #10;
  bus_lock.put();
endtask
```

### `event`

見第 7 章。

## 12.2 行程控制

```systemverilog
process p;
initial begin
  fork
    begin p = process::self(); forever #10; end
  join_none
  #55;
  p.kill();
end
```

常用：`wait fork;`（等待所有子執行緒）、`disable fork;`（終止子執行緒）。

## 12.3 分層 Testbench 架構

```
        ┌───────────────────────── Environment ─────────────────────────┐
        │                                                                │
        │  Generator → mbx → Driver ──► [ DUT ] ──► Monitor → mbx → Scoreboard
        │                         (via virtual interface)                │
        └────────────────────────────────────────────────────────────────┘
```

| 元件 | 職責 |
|------|------|
| Transaction | 資料單位（封包），含 rand 欄位與約束 |
| Generator | 產生隨機交易，送入 mailbox |
| Driver | 把交易轉為腳位層級的訊號驅動 DUT |
| Monitor | 觀察 DUT 介面，還原成交易 |
| Scoreboard | 比對預期與實際結果 |
| Environment | 組裝並啟動各元件 |
| Test | 設定情境並啟動 Environment |

### 骨架範例

```systemverilog
class Transaction;
  rand bit [7:0] data;
  function void print(string tag); $display("[%s] data=%h", tag, data); endfunction
endclass

class Generator;
  mailbox #(Transaction) gen2drv;
  int count;
  function new(mailbox #(Transaction) m, int n); gen2drv = m; count = n; endfunction
  task run();
    repeat (count) begin
      Transaction t = new();
      void'(t.randomize());
      gen2drv.put(t);
    end
  endtask
endclass

class Driver;
  virtual dut_if vif;
  mailbox #(Transaction) gen2drv;
  function new(virtual dut_if v, mailbox #(Transaction) m); vif = v; gen2drv = m; endfunction
  task run();
    forever begin
      Transaction t;
      gen2drv.get(t);
      @(posedge vif.clk);
      vif.valid <= 1'b1;
      vif.data  <= t.data;
      @(posedge vif.clk);
      vif.valid <= 1'b0;
    end
  endtask
endclass

class Monitor;
  virtual dut_if vif;
  mailbox #(Transaction) mon2scb;
  function new(virtual dut_if v, mailbox #(Transaction) m); vif = v; mon2scb = m; endfunction
  task run();
    forever begin
      @(posedge vif.clk);
      if (vif.valid) begin
        Transaction t = new();
        t.data = vif.data;
        mon2scb.put(t);
      end
    end
  endtask
endclass

class Scoreboard;
  mailbox #(Transaction) mon2scb;
  int pass, fail;
  function new(mailbox #(Transaction) m); mon2scb = m; endfunction
  task run();
    Transaction t;
    forever begin
      mon2scb.get(t);
      // 與參考模型比對
      pass++;
    end
  endtask
endclass

class Env;
  Generator g; Driver d; Monitor m; Scoreboard s;
  mailbox #(Transaction) g2d = new(), m2s = new();

  function new(virtual dut_if vif, int n);
    g = new(g2d, n);
    d = new(vif, g2d);
    m = new(vif, m2s);
    s = new(m2s);
  endfunction

  task run();
    fork
      g.run(); d.run(); m.run(); s.run();
    join_any
    #100;                      // 等待收尾
    $display("pass=%0d fail=%0d", s.pass, s.fail);
  endtask
endclass
```

（`dut_if` 為含 `clk`、`valid`、`data` 的 interface，寫法參考第 6 章。）

## 12.4 DPI-C：與 C 互通

```systemverilog
import "DPI-C" function int c_add(int a, int b);

initial $display("c_add = %0d", c_add(3, 4));
```

```c
// add.c
int c_add(int a, int b) { return a + b; }
```

常用於接入 C/C++ 參考模型。編譯方式依模擬器而異。

## 12.5 UVM 簡介

**UVM (Universal Verification Methodology)** 是建立在 SystemVerilog 之上的標準化驗證方法學（IEEE 1800.2），提供一套可重用的類別函式庫。

### 與上一節自建架構的對應

| 自建 | UVM |
|------|-----|
| Transaction | `uvm_sequence_item` |
| Generator | `uvm_sequence` + `uvm_sequencer` |
| Driver | `uvm_driver` |
| Monitor | `uvm_monitor` |
| Scoreboard | `uvm_scoreboard` |
| Environment | `uvm_env` |
| Test | `uvm_test` |
| mailbox | TLM port / analysis port |
| 手動呼叫 `run()` | Phase 機制（build → connect → run → report） |

### UVM 的核心優點

- **Factory**：可在不改程式碼下替換元件/交易類型
- **Configuration DB**：集中傳遞設定與 virtual interface
- **Phase**：統一的建構與執行順序
- **Sequence**：場景與驅動分離，易於重用與堆疊
- **Reporting**：統一的訊息與嚴重性控制

### 最小 UVM 範例（示意）

```systemverilog
import uvm_pkg::*;
`include "uvm_macros.svh"

class my_test extends uvm_test;
  `uvm_component_utils(my_test)
  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction

  task run_phase(uvm_phase phase);
    phase.raise_objection(this);
    `uvm_info("TEST", "Hello UVM!", UVM_LOW)
    phase.drop_objection(this);
  endtask
endclass

module top;
  initial run_test("my_test");
endmodule
```

> 建議在完成第 8、9、12 章後再學 UVM，會更容易理解它為什麼這樣設計。

## 練習

1. 將上述骨架補齊（加入 DUT 與 `dut_if`），讓 Generator 發 20 筆交易，Scoreboard 與簡單參考模型比對。
2. 用 `semaphore` 模擬兩個 master 競爭同一匯流排。
3. 在 Monitor 中加入第 11 章的 covergroup。

---

⬅️ [上一章：11. 功能覆蓋率](11_功能覆蓋率) ｜ [📚 回目錄](00_目錄與學習路線) ｜ [下一章：13. 綜合練習與資源](13_綜合練習與資源) ➡️