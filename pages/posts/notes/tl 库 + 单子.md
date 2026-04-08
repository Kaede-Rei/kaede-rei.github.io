---
title: TL 库 + 单子
date: 2026-04-08
updated: 2026-04-08
categories: 笔记
tags:
  - C++
  - 接口设计
  - 函数式编程
top: 2
cover: /images/covers/ansy.jpg
---

## 1. 引言

在各类复杂业务场景中，经常需要处理“输入如何表达、失败如何传递、多个步骤如何拼接”的问题；若沿用传统的“bool 返回值 + 输出参数 + 日志”组合，代码往往会陷入以下困境：

- 语义缺失： 返回 false 仅能表达失败，却丢失了具体的错误上下文
- 维护成本高： 过多的输出参数导致函数签名臃肿，中间对象常处于“半初始化”状态
- 流程支离破碎： 逻辑转换中充斥着冗长的 if/else 嵌套，核心路径被错误处理淹没

解决这些问题需要将 **“值本身”与“计算的状态（是否存在、是否失败）”解耦**；在函数式编程中，**单子（Monad）**用于处理上下文计算——它通过封装副作用，允许我们将多个逻辑步骤通过链式调用组合在一起

虽然 C++ 自 C++17 起逐步引入了 std::optional 和 std::expected 来尝试标准化这一范式，但直到 C++23 才有完整的链式操作（如 and_then, transform）支持；这使得在旧标准或跨平台项目中难以享受到现代函数式的便利

而 TL 库（TartanLlama Libraries）填补了这一空白，该库作为一个兼容 C++11/14/17 的现代库，它提供了 tl::optional 和 tl::expected 等完整实现；通过支持 and_then、map/transform、or_else 等操作符，TL 库可以在旧生产环境中即可构建出语义清晰、错误可追踪且高度组合化的链式代码

## 2. `tl::optional` 简介

`tl::optional<T>` 用来表达：一个值可能有，也可能没有

其重点不是“更现代”，而是把“可缺失”写进类型系统；例如查询类结果里，并不是每个命令都会返回当前位姿或当前关节角，这类字段很适合写成：

```cpp
tl::optional<geometry_msgs::Pose> current_pose;
tl::optional<std::vector<double>> current_joints;
```

而不是：

```cpp
geometry_msgs::Pose current_pose;
std::vector<double> current_joints;
bool has_pose;
bool has_joints;
```

前者把“有无”与“值本身”绑定在一起，避免了使用未初始化数据或标志位漏同步的低级错误

## 3. `optional` 的使用场景

### 3.1. 结果字段不一定存在

查询结果对象、缓存命中结果、部分填充的响应对象，都适合用 `optional`

### 3.2 某步尝试可能成功，也可能没有结果

例如：

- 尝试从请求中提取某类目标
- 尝试从当前状态补全目标位姿
- 尝试从配置中读到某个可选字段

### 3.3 失败不一定是错误，只是“没有值”

例如一个可选约束、一个可选反馈、一个可选默认值来源

如果“没有结果”并不意味着流程异常，那么 `optional` 比错误码更贴切

### 3.4. 但不适合替代多类型输入本身

例如一个目标可能是：

- `Pose`
- `Point`
- `Quaternion`
- `PoseStamped`

这种“多选一”问题，本质上应该用 `variant`，而不是 `optional`，因为：

- `optional` 解决的是“有没有”
- `variant` 解决的是“是哪一种”

两者不是同一个维度

### 3.5. 也不适合包住本来就一定存在的核心字段

例如：

- 命令类型
- 执行状态
- 错误码
- 成功标记

这些字段是结果对象的核心骨架，不应再套一层 `optional`

### 3.6. `variant + monostate` 与 `optional<variant>` 的选择

接口设计里经常会遇到这两种写法：

```cpp
using TargetVariant = std::variant<
    std::monostate,
    geometry_msgs::Pose,
    geometry_msgs::Point,
    geometry_msgs::Quaternion,
    geometry_msgs::PoseStamped
>;
```

或者：

```cpp
using TargetVariant = std::variant<
    geometry_msgs::Pose,
    geometry_msgs::Point,
    geometry_msgs::Quaternion,
    geometry_msgs::PoseStamped
>;

tl::optional<TargetVariant> target;
```

**前者的优缺点：**

- 优点：
    - 少一层解包
    - 默认构造天然可表示“空目标”
    - 现有 `visit` 流程会更直接

- 缺点：
    - “空值”被混进了“目标类型集合”
    - 语义上略微混杂

**后者的优缺点：**

- 优点：
    - “有没有值”和“值是哪种类型”分层清楚
    - 建模更纯

- 缺点：
    - 需要先拆 `optional` 再拆 `variant`
    - 调用路径稍微多一层壳

## 4. `tl::expected` 简介

`tl::expected<T, E>` 用来表达：要么得到一个值 `T`，要么得到一个错误 `E`

它适合出现于以下场景：

- 失败需要结构化原因
- 调用方必须知道错误详情
- 多步转换中每一步都可能失败
- 不希望只靠日志表达错误
- 不希望抛出 C++ 异常

例如：

```cpp
tl::expected<geometry_msgs::Pose, ErrorCode>
normalize_target(const TargetVariant& target);
```

它表达的含义很明确：

- 成功：得到归一化后的 `Pose`
- 失败：得到一个 `ErrorCode`

这比 `bool normalize_target(const TargetVariant& target, geometry_msgs::Pose& out_pose);` 要清楚得多，因为输出值与错误结果在类型层面就已经绑定

## 5. `expected` 的使用场景

### 5.1. 多步转换中的错误传播

例如一个目标请求可能要经过：

1. 从输入中解析具体类型
2. 补全缺失位置或姿态
3. 统一成完整 `Pose`
4. 转换到基坐标系
5. 检查边界与合法性
6. 送入规划器

如果每一步都只返回 `bool`，最后会得到一串非常冗长的条件分支。

而如果每一步都返回 `expected<T, ErrorCode>`，就能把失败沿链条自然往上传。

### 5.2. 代替“日志即错误处理”

日志可以辅助排查，但日志不是接口协议；如果错误只留在日志里，而不进返回值，那么调用方拿不到结构化失败原因。`expected` 恰好解决这个问题

### 5.3. 示例

```cpp
tl::expected<geometry_msgs::Pose, ErrorCode>
build_pose_from_target(const TargetVariant& target,
                       const geometry_msgs::Pose& current_pose) {
    if(std::holds_alternative<geometry_msgs::Pose>(target)) {
        return std::get<geometry_msgs::Pose>(target);
    }

    if(std::holds_alternative<geometry_msgs::Point>(target)) {
        geometry_msgs::Pose pose = current_pose;
        pose.position = std::get<geometry_msgs::Point>(target);
        return pose;
    }

    return tl::make_unexpected(ErrorCode::INVALID_TARGET_TYPE);
}
```

## 6. 单子与链式调用

这里的“单子”不需要上升到抽象代数层面；在工程代码里，只需要把它理解成：把一系列“可能失败”的步骤包装成相同形式，然后按顺序串起来，让失败自动短路，成功继续向后传值

TL 库提供了几个极其强大的核心操作符：

- `and_then`：当前面的步骤成功时，执行下一步；下一步的函数也会返回 `expected` 或 `optional`（可能失败的转换）

- `transform` (或 `map`)：当前面的步骤成功时，执行下一步；下一步的函数返回普通值（绝对不会失败的转换）

- `or_else`：当前面的步骤失败时，执行错误处理（如重试或提供默认值）

### 6.1. 链式调用示例

接口有：

```cpp
tl::expected<TargetVariant, ErrorCode> extract_target(const ArmCmdRequest& req);
tl::expected<geometry_msgs::Pose, ErrorCode> normalize_pose(const TargetVariant& target);
tl::expected<void, ErrorCode> transform_to_base(geometry_msgs::Pose& pose);
tl::expected<void, ErrorCode> set_pose_target(const geometry_msgs::Pose& pose);
tl::expected<void, ErrorCode> plan_and_execute();
```

逻辑上就是：提取目标 -> 归一化为完整 Pose -> 转换到基坐标系 -> 设置目标 -> 规划与执行

如果每一步都用统一返回类型，就可以很自然地串起来，而不需要在每一步都写 if/else 来检查错误：

```cpp
tl::expected<void, ErrorCode> execute_monadic(const ArmCmdRequest& req) {
    return extract_target(req)
        .and_then([](const TargetVariant& t) { return normalize_pose(t); })
        .and_then([](geometry_msgs::Pose& p) { return transform_to_base(p); })
        .and_then([](const geometry_msgs::Pose& p) { return set_pose_target(p); })
        .and_then(plan_and_execute);
}
``` 

任何一步失败，后续的 .and_then 都会被直接跳过（短路），最终的返回值就是那个导致失败的 ErrorCode；整个核心业务路径一目了然，而错误处理也被自然地沿链条传递

### 6.2. `optional` 与 `expected` 的分工

#### 用 `optional` 的时候

- 只想表达“可能没有”
- “没有值”不是错误，只是缺失
- 不关心详细失败原因

#### 用 `expected` 的时候

- 失败需要原因
- 失败会影响后续流程
- 调用方必须知道错误类型
- 多步转换需要稳定传递错误

在接口层里，`expected` 通常比 `optional` 更适合承载“转换失败”
