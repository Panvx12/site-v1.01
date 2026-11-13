# 第 8 章　物件導向程式設計 (OOP)

> `class` 僅用於 testbench（不可合成）。OOP 讓驗證環境更模組化、可重用。

## 8.1 Class 基本概念

```systemverilog
class Packet;
  logic [7:0] addr;
  logic [7:0] data;
  static int  count = 0;     // 靜態成員：所有物件共用

  function new(logic [7:0] a = 0, logic [7:0] d = 0);
    addr = a;
    data = d;
    count++;
  endfunction

  function void print();
    $display("Packet addr=%h data=%h", addr, data);
  endfunction
endclass

module tb;
  initial begin
    Packet p1, p2;
    p1 = new(8'h10, 8'hAA);    // 建立物件
    p1.print();
    p2 = p1;                    // 複製的是「句柄」，指向同一物件！
    p2.data = 8'hFF;
    p1.print();                 // data 已變成 FF
    $display("count = %0d", Packet::count);
  end
endmodule
```

⚠️ **句柄 (handle) ≠ 物件**。`p2 = p1` 只是多了一個指向同物件的指標。

## 8.2 淺層複製與深層複製

```systemverilog
Packet p3 = new p1;     // 淺層複製：複製欄位，但物件成員仍共用
```

自訂 `copy()` 可做深層複製：

```systemverilog
function Packet copy();
  Packet c = new(this.addr, this.data);
  return c;
endfunction
```

## 8.3 繼承 (Inheritance)

```systemverilog
class BasePkt;
  logic [7:0] data;
  function void show();
    $display("Base data=%h", data);
  endfunction
endclass

class ErrPkt extends BasePkt;
  bit corrupt;
  function void show();
    super.show();                 // 呼叫父類別方法
    $display("  corrupt=%b", corrupt);
  endfunction
endclass
```

## 8.4 多型 (Polymorphism) 與 `virtual`

```systemverilog
class Shape;
  virtual function real area();
    return 0.0;
  endfunction
endclass

class Square extends Shape;
  real s;
  function new(real s); this.s = s; endfunction
  virtual function real area(); return s * s; endfunction
endclass

class Circle extends Shape;
  real r;
  function new(real r); this.r = r; endfunction
  virtual function real area(); return 3.14159 * r * r; endfunction
endclass

module tb;
  initial begin
    Shape shapes[$];
    shapes.push_back(Square::new(2.0));
    shapes.push_back(Circle::new(1.0));
    foreach (shapes[i]) $display("area = %f", shapes[i].area());
  end
endmodule
```

- 沒有 `virtual` → 依**句柄型別**決定呼叫哪個方法
- 有 `virtual` → 依**實際物件型別**決定（多型）
- 父類別可以用 `virtual class` 宣告為抽象類別，並以 `pure virtual` 強制子類別實作

```systemverilog
virtual class Base;
  pure virtual function void run();
endclass
```

## 8.5 存取控制

| 關鍵字 | 意義 |
|--------|------|
| （預設）public | 任何地方可存取 |
| `local` | 僅限該類別內 |
| `protected` | 該類別與其子類別 |

## 8.6 參數化類別

```systemverilog
class Stack #(type T = int);
  T items[$];
  function void push(T x); items.push_back(x); endfunction
  function T pop();        return items.pop_back(); endfunction
endclass

Stack#(string) s = new();
```

## 8.7 實戰範例：簡易 Driver / Monitor 架構

```systemverilog
class Transaction;
  rand logic [7:0] addr;
  rand logic [7:0] data;
  function void print(string tag = "");
    $display("[%s] addr=%h data=%h", tag, addr, data);
  endfunction
endclass

class Driver;
  virtual bus_if vif;
  function new(virtual bus_if v); vif = v; endfunction

  task drive(Transaction t);
    vif.valid <= 1'b1;
    vif.data  <= {t.addr, t.data};
    @(posedge vif.clk);
    vif.valid <= 1'b0;
  endtask
endclass
```

（`bus_if` 的定義見第 6 章，將 `data` 寬度調整為 16 即可。）

## 8.8 常見陷阱

⚠️ 使用句柄前一定要先 `new()`，否則存取會得到 null 指標錯誤。
⚠️ 方法重寫 (override) 時，簽名（參數、回傳型別）必須相同。
⚠️ 需要被覆寫的方法要在父類別標 `virtual`。

## 練習

1. 建立 `Animal` 抽象類別，派生 `Dog`、`Cat`，各自實作 `speak()`，放進陣列用多型呼叫。
2. 為 `Transaction` 實作 `copy()` 與 `compare()` 方法。
3. 建立參數化的 `Queue` 包裝類別，提供 `enqueue`、`dequeue`、`size`。

---

⬅️ [上一章：7. Testbench基礎](07_Testbench基礎) ｜ [📚 回目錄](00_目錄與學習路線) ｜ [下一章：9. 隨機化與約束](09_隨機化與約束) ➡️