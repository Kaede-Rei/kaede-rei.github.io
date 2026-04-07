---
title: X-Macro + 单例模式
date: 2026-04-07
updated: 2026-04-07
categories: 笔记
tags:
  - C
  - C++
  - 接口设计
  - 代码组织
top: 2
cover: /images/covers/ansy1.png
---

## 1. 引言

在项目推进过程中，接口数量、命令种类、状态枚举和映射关系会快速膨胀。一个命令常常同时出现在以下多个位置：

- 枚举定义
- 字符串名称映射
- 描述文本
- 处理函数声明
- 分发表
- 测试项列表
- 文档说明

当这些信息分散在多个文件中时，新增或修改一条命令，往往需要同步改动多个位置；短期内问题不明显，一旦接口层逐渐完整，就会出现以下典型现象：

- 枚举已经新增，但字符串映射漏改
- 分发表已存在，但处理函数声明缺失
- 文档中的命令说明与代码实现不一致
- 测试脚本沿用旧命令名，接口层已经变更

这类问题并不是语法错误，而是“主数据分散”导致维护困难。针对这类问题，X-Macro 是一个非常有效的收口手段

---

## 2. X-Macro 简介

X-Macro 不是宏技巧展示，而是一种“把一组重复维护的数据集中成一张表”的工程方法，核心思路即：
> 先维护一份主表，再从主表派生出枚举、函数声明、分发表、字符串映射和说明文本

一个最小例子如下：

```cpp
#define FRUIT_TABLE \
    X(APPLE,  "apple") \
    X(BANANA, "banana") \
    X(PEAR,   "pear")

#define X(name, str) name,
enum class Fruit {
    FRUIT_TABLE
    MAX
};
#undef X

#define X(name, str) case Fruit::name: return str;
const char* to_string(Fruit f) {
    switch(f) {
        FRUIT_TABLE
        default: return "unknown";
    }
}
#undef X
```

真正被维护的只有宏 `FRUIT_TABLE`；其余部分都只是这张表的“投影”

---

## 3. X-Macro 的优点

### 3.1. 命令天然就是表结构

以机械臂项目为例，其中很多能力天然是离散枚举项，例如：

- 回零
- 回初始位
- 关节空间运动
- 末端目标运动
- 工具坐标系相对运动
- 直线运动
- 贝塞尔轨迹
- 笛卡尔路径
- 约束设置
- 查询当前状态

这类信息都满足两个特征：

1. 数量会逐渐增加
2. 会被多个模块重复使用

因此非常适合用 X-Macro 来维护，可以集中成一张表，避免分散维护带来的同步问题

### 3.2. 分发表与命令表天然耦合

通常命令需要通过分发器来调用对应的处理函数，命令调度本质就是：

- 根据命令类型找到表项
- 读取名字、描述、是否支持反馈
- 调用对应成员函数

这本身就是表驱动逻辑，用 X-Macro 来维护命令元数据，结构上更自然，即使是最简单的 `switch-case` 分发，也能直接从表中派生出来，避免了分发表和命令表之间的重复维护

### 3.3. 嵌入式与上位机都会反复遇到同类问题

无论是嵌入式固件还是上位机软件，都会遇到同类型的代码组织问题：

- 状态机事件表
- 命令字表
- 执行器模式表
- 错误码表
- 服务/动作能力表

也就是说，这不是某个单独仓库的局部问题，而是控制系统开发中的普遍问题

---

## 4. 以机械臂项目为例

以机械臂命令表为例，可以定义为一张表：

```cpp
#define ARM_CMD_TABLE \
    X(HOME,                     home,                       false,  "回到初始位置") \
    X(MOVE_JOINTS,              move_joints,                true,   "关节空间运动") \
    X(MOVE_TARGET,              move_target,                true,   "末端执行器空间运动") \
    X(MOVE_TARGET_IN_EEF_FRAME, move_target_in_eef_frame,   true,   "工具坐标系相对运动") \
    X(MOVE_LINE,                move_line,                  true,   "直线运动") \
    X(MOVE_BEZIER,              move_bezier,                true,   "贝塞尔曲线运动")
```

### 4.1. 生成枚举

```cpp
#define X(name, handler, has_fb, desc) name,
enum class ArmCmdType {
    ARM_CMD_TABLE
    MAX
};
#undef X
```

### 生成处理函数声明

```cpp
#define X(name, handler, has_fb, desc) \
    ArmCmdResult handle_##handler(const ArmCmdRequest&, FeedbackCb = nullptr);

struct Impl {
    ARM_CMD_TABLE
};
#undef X
```

### 生成分发表

```cpp
#define X(name, handler, has_fb, desc) \
    Entry{ ArmCmdType::name, #name, desc, has_fb, &Impl::handle_##handler },

static const std::array<Entry, static_cast<std::size_t>(ArmCmdType::MAX)> kTable{{
    ARM_CMD_TABLE
}};
#undef X
```

### X-Macro 的核心收益

这类写法的核心收益不是“代码更短”，而是：

- 新增命令时只需要先改主表
- 相关投影自动同步
- 枚举、说明、处理器和映射关系更不容易漂移

---

## 5. X-Macro 的局限性与不适用的场景

### 5.1. Intellisense 支持不友好

由于 X-Macro 的特殊写法，IDE 的代码分析和提示功能可能无法正确识别宏展开后的结构，导致：

- 跳转定位模糊：跳转定义时，IDE 通常只能定位到宏的起点而非具体的表项行
- 重构功能失灵：自动化重构工具无法识别并同步修改宏定义内部的文本，必须依赖手动查找替换
- 报错指向混乱：宏内部语法错误会导致波浪线在调用处集体报错，难以精确追踪到具体的表项逻辑
- 调试跟踪断层：调试器将宏展开视为单行指令，无法在单步执行时进入特定投影逻辑的内部

### 5.2. 不适合复杂逻辑（不适用的场景）

- 每项差异很大，无法抽象成统一列结构
- 后续派生形式并不固定
- 只有一个地方会使用这组数据
- 数据本身更适合运行时注册，而非编译期枚举

如果表项之间的字段差异很大，强行使用 X-Macro，反而会让宏表变得难懂

---

## 6. 单例模式简介

单例模式在控制系统开发里很常见，但也很容易被滥用，不能把单例模式理解为“全局变量换个写法”，而是只在以下场景考虑使用：

- 系统内确实只能存在一个实例
- 该实例需要上下层解耦
- 同类设备需要运行时变更
- 生命周期应当覆盖全局
- 初始化顺序需要可控
- 访问入口需要统一
- 需要清爽的 Intellisense 支持

例如：

- 全局日志器
- 统一配置中心
- 硬件抽象层中的通用模块
- 全局任务调度器
- 状态机管理器

## 7. 对象唯一单例与入口唯一单例

对象唯一单例是指系统内只能存在一个实例，例如全局日志器；入口唯一单例是指虽然可以存在多个实例，但访问入口必须统一，例如设备管理器

对象唯一很好理解，而入口唯一可以以 motor 单例为例，上层接口只暴露一个 `motor` 实例，但底层可以根据配置或运行时条件切换不同的实现，例如：

- 不同电机厂商
- 真机与仿真环境
- 不同版本的硬件

入口唯一单例的核心价值是：

- 让抽象入口稳定
- 让底层实现可替换
- 让上层只依赖接口，不依赖具体实现

如果一定要有单例，那么单例应当持有的是**抽象接口指针/引用**，而不是把所有实现细节直接焊死在内部。

## 8. 单例模式的实现与局限性

### 8.1. 单例模式的实现

入口唯一单例的实现示例：

```c
#ifndef _MOTOR_H_
#define _MOTOR_H_

#include <stdint.h>

/**
 * @brief 电机单例，用户自定义名称
 */
#define motor motor_instance

/**
 * @brief 电机实例
 */
extern const struct MotorInterface {
    /**
     * @brief 将电机状态码转换为字符串
     * @param status 电机状态码
     */
    const char* (*status_str)(MotorStatus status);
    /**
     * @brief 将电机模式转换为字符串
     * @param mode 电机模式
     */
    const char* (*mode_str)(MotorMode mode);
    /**
     * @brief 使能电机
     * @param id 电机 ID
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*enable)(uint16_t id);

    /**
     * @brief 禁用电机
     * @param id 电机 ID
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*disable)(uint16_t id);

    /**
     * @brief 设置 MIT 模式
     * @param id 电机 ID
     * @param pos 目标位置
     * @param spd 目标速度
     * @param kp 位置环比例增益
     * @param kd 位置环微分增益
     * @param torque 目标电流
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*set_mit)(uint16_t id, float pos, float spd, float kp, float kd, float torque);

    /**
     * @brief 设置位置速度模式
     * @param id 电机 ID
     * @param pos 目标位置
     * @param spd 目标速度
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*set_pos_spd)(uint16_t id, float pos, float spd);

    /**
     * @brief 设置速度模式
     * @param id 电机 ID
     * @param spd 目标速度
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*set_spd)(uint16_t id, float spd);

    /**
     * @brief 设置位置速度电流模式
     * @param id 电机 ID
     * @param pos 目标位置
     * @param spd 目标速度
     * @param cur 目标电流
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*set_pos_spd_cur)(uint16_t id, float pos, float spd, float cur);

    /**
     * @brief 获取电机原始反馈数据
     * @param id 电机 ID
     * @param feedback 反馈数据数组，长度为8
     * @param timeout_ms 超时时间（毫秒）
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*get_feedback)(uint16_t id, uint8_t feedback[8], uint32_t timeout_ms);

    /**
     * @brief 获取电机错误码
     * @param id 电机 ID
     * @param err_code 错误码指针
     * @param timeout_ms 超时时间（毫秒）
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*get_err_code)(uint16_t id, uint8_t* err_code, uint32_t timeout_ms);

    /**
     * @brief 获取电机位置
     * @param id 电机 ID
     * @param pos 位置指针
     * @param timeout_ms 超时时间（毫秒）
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*get_pos)(uint16_t id, float* pos, uint32_t timeout_ms);

    /**
     * @brief 获取电机速度
     * @param id 电机 ID
     * @param spd 速度指针
     * @param timeout_ms 超时时间（毫秒）
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*get_spd)(uint16_t id, float* spd, uint32_t timeout_ms);

    /**
     * @brief 获取电机扭矩
     * @param id 电机 ID
     * @param torque 扭矩指针
     * @param timeout_ms 超时时间（毫秒）
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*get_torque)(uint16_t id, float* torque, uint32_t timeout_ms);

    /**
     * @brief 主动请求电机反馈
     * @param id 电机 ID
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*request_feedback)(uint16_t id);

    /**
     * @brief 更新电机反馈结构体
     * @param feedback 电机反馈结构体指针
     * @return MotorStatus 枚举类型，表示操作结果
     */
    MotorStatus(*update)(MotorFeedback* feedback);
} motor_instance;

void set_motor_instance(const struct MotorInterface* instance);

#endif
```

在这个示例中，`motor` 是一个入口唯一单例，暴露了一个抽象接口 `MotorInterface`，上层代码通过 `motor` 来调用电机相关的功能，而底层可以根据实际情况切换不同的实现，并由一个指向设置函数来设置 `motor_instance` 的指向，这样就实现了接口与实现的分离，同时保证了访问入口的统一和可替换性，上层调用也非常清爽：

```c
// init.c 或 setting.c
#include "motor.h"
#include "dm_motor.h"

void init_system() {
    // 根据配置或运行时条件选择电机实现
    set_motor_instance(&d_dm_motor_instance);
}

void switch_motor() {
    // 运行时切换电机实现，例如从真机切换到仿真
    set_motor_instance(&sim_motor_instance);
}
```
```c
// app.c
#include "motor.h"
#define mt motor // 通过宏定义实现类似 import ... as ... 的效果

void app() {
    // 使用 motor 单例调用电机接口
    // 当初始化或者运行时切换不同实现时，业务层保持不变，实现上下层的解耦
    mt.enable(1);
    mt.set_pos_spd(1, 90.0f, 10.0f);
}
```

### 8.2. 单例模式的风险

单例模式主要风险在于容易被滥用，例如：

- 本应多实例的对象被设计成单例，导致无法支持多设备或多实例场景
- 让单例承担过多职责，导致接口臃肿，难以维护
- 隐式依赖过多，导致调试与重构困难

所以单例模式虽然在某些场景下非常有用，但也需要谨慎使用，确保它真正适合当前的设计需求，而不是为了方便而滥用

## 9. 总结

X-Macro 是一种非常有效的工程方法，可以集中维护一组相关的数据，避免分散维护带来的同步问题；单例模式则是一种设计模式，可以实现全局唯一的访问入口，适用于某些特定场景，但也需要谨慎使用，避免滥用带来的风险，通过合理使用 X-Macro 和单例模式，可以提升代码的可维护性和可扩展性，减少重复劳动和潜在的错误
