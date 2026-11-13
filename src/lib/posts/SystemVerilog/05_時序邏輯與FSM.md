# 第 5 章　時序邏輯與有限狀態機

## 5.1 `always_ff`

```systemverilog
always_ff @(posedge clk) begin
  q <= d;
end
```

- 只能描述正反器，使用**非阻塞賦值 `<=`**
- 工具會檢查是否寫成了組合邏輯

## 5.2 重置 (Reset)

### 同步重置

```systemverilog
always_ff @(posedge clk) begin
  if (!rst_n) q <= '0;
  else        q <= d;
end
```

### 非同步重置

```systemverilog
always_ff @(posedge clk or negedge rst_n) begin
  if (!rst_n) q <= '0;
  else        q <= d;
end
```

| 類型 | 優點 | 缺點 |
|------|------|------|
| 同步 | 時序分析簡單 | 需要時脈才能重置 |
| 非同步 | 不需時脈即可重置 | 釋放 (deassert) 需與時脈同步，否則有亞穩態風險 |

## 5.3 常見範例

### 計數器

```systemverilog
module counter #(parameter int W = 4)(
  input  logic         clk, rst_n, en,
  output logic [W-1:0] cnt
);
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)   cnt <= '0;
    else if (en)  cnt <= cnt + 1'b1;
  end
endmodule
```

### 移位暫存器

```systemverilog
module shift_reg #(parameter int N = 8)(
  input  logic clk, rst_n, din,
  output logic [N-1:0] q
);
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= '0;
    else        q <= {q[N-2:0], din};
  end
endmodule
```

### 邊緣偵測

```systemverilog
module edge_detect (
  input  logic clk, rst_n, sig,
  output logic rise
);
  logic sig_d;
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) sig_d <= 1'b0;
    else        sig_d <= sig;
  end
  assign rise = sig & ~sig_d;
endmodule
```

## 5.4 有限狀態機 (FSM)

### 推薦的「三段式」寫法

1. 狀態暫存器（時序）
2. 下一狀態邏輯（組合）
3. 輸出邏輯（組合或時序）

### 範例：偵測序列 `101`（重疊式，Moore 型）

```systemverilog
module seq_detect_101 (
  input  logic clk, rst_n, din,
  output logic found
);
  typedef enum logic [1:0] {S0, S1, S10, S101} state_t;
  state_t state, next;

  // 1. 狀態暫存器
  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) state <= S0;
    else        state <= next;
  end

  // 2. 下一狀態邏輯
  always_comb begin
    next = state;                      // 預設保持
    unique case (state)
      S0:   next = din ? S1   : S0;
      S1:   next = din ? S1   : S10;
      S10:  next = din ? S101 : S0;
      S101: next = din ? S1   : S10;   // 重疊：最後的 1 可當下一個序列開頭
    endcase
  end

  // 3. 輸出邏輯（Moore：只與狀態有關）
  always_comb begin
    found = (state == S101);
  end
endmodule
```

### Moore 與 Mealy

| 型 | 輸出取決於 | 特點 |
|----|-----------|------|
| Moore | 目前狀態 | 輸出穩定，較不易毛刺 |
| Mealy | 狀態與輸入 | 狀態數較少，反應快一個週期 |

## 5.5 範例：紅綠燈

```systemverilog
module traffic (
  input  logic clk, rst_n,
  output logic red, yellow, green
);
  typedef enum logic [1:0] {RED, GREEN, YELLOW} st_t;
  st_t st, nx;
  logic [3:0] timer;

  always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin st <= RED; timer <= '0; end
    else begin
      st <= nx;
      timer <= (st != nx) ? '0 : timer + 1'b1;
    end
  end

  always_comb begin
    nx = st;
    case (st)
      RED:    if (timer == 9) nx = GREEN;
      GREEN:  if (timer == 7) nx = YELLOW;
      YELLOW: if (timer == 2) nx = RED;
      default: nx = RED;
    endcase
  end

  assign {red, yellow, green} = {st==RED, st==YELLOW, st==GREEN};
endmodule
```

## 5.6 常見陷阱

⚠️ 在 `always_ff` 中使用阻塞賦值 `=` 會造成模擬競爭 (race condition)。
⚠️ 一個變數只能被一個 `always_ff`（或一個 `always_comb`）驅動。
⚠️ 組合邏輯與時序邏輯的敏感列表不要混寫在同一個 always 中。

## 練習

1. 實作可預載值的上下計數器 (up/down counter with load)。
2. 修改 `seq_detect_101` 成「非重疊」版本。
3. 設計自動販賣機 FSM：接受 5 元、10 元，累計滿 15 元出貨。
4. 用兩級正反器實作非同步訊號的同步器 (synchronizer)。
