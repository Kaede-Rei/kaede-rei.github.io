---
title: "机械臂系统开发"
layout: technical-doc
contentType: learning-route
track: robot-arm-development
order: 2
parentLink: "/learning-path"
summary: "从机械臂本体设计、软件开发与外设接入，走到仿真验证和实机部署"
---

## 全书结构与术语分层

| 部分 | 回答的问题 | 要点 |
| --- | --- | --- |
| 一、机械臂本体设计 | 机械本体能否支撑任务？ | 构型、结构、传动、执行器、电气与走线、几何/动力学模型、装配与验证报告 |
| 二、机械臂软件开发 | 如何把模型变成可执行、可验证的运动？ | 软件架构、设备接口、实时运行、建模/标定、控制、规划、任务、学习、仿真与部署 |
| 三、机械臂外设开发 | 相机、工具、示教与辅助设备如何接入？ | 设备边界、接口语义、时间/坐标约定、联调与验收 |
| 附录 | 怎样选择运行架构并开展验证？ | 章节实现矩阵、三种架构的实施路线、仿真平台实践与参考资料 |

| 层级 | 核心问题 | 典型术语、算法与接口 |
| --- | --- | --- |
| 设备/接口层 | 命令与反馈如何可靠传输？ | EtherCAT（CoE、DC）、CAN/CAN FD（CANopen）、RS-485/Modbus、EtherNet/IP、PROFINET、DDS、gRPC；CiA 402；CSP/CSV/CST、MIT 模式 |
| 关节层 | 单个关节如何稳定跟踪？ | PID、串级 P-PI、前馈、重力/摩擦补偿、计算力矩控制、DOB、抗饱和、增益调度 |
| 建模层 | 几何与动力学量如何计算？ | DH/MDH、POE、Jacobian、RNEA/ABA/CRBA、Lagrange/Newton–Euler、最小二乘辨识 |
| 状态估计层 | 不可直接测量的状态如何获得？ | 低通/互补滤波、KF/EKF/UKF、动量观测器、扰动观测器 |
| 控制层 | 末端如何跟踪与交互？ | 计算力矩、操作空间控制（OSC）、阻抗/导纳、力位混合、LQR/MPC、IBVS/PBVS |
| 规划层 | 如何在约束下找到运动？ | RRT/RRT\*、PRM、A\*、CHOMP/STOMP/TrajOpt、TOPP、TOTG、Ruckig |
| 任务层 | 如何选择并组织动作？ | 状态机、行为树、PDDL/HTN、TAMP、PDDLStream、MoveIt Task Constructor |
| 学习层 | 如何从数据中获得策略？ | 行为克隆、ACT、Diffusion Policy、PPO/SAC、Sim2Real、VLA |
