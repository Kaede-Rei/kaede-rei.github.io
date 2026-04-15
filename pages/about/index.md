---
title: 关于我
markdownClass: about-page
aside: false
comment: false
toc: true
---

# 👋 你好，我是 Kaede Rei

目前是 **华南农业大学 (SCAU)** 本科生，同时作为 **广东省农业科学院 (GAAS)** 项目合作成员以及 **AgroTech 协会** 电控与机械臂运控组负责人展开工作。

我致力于成为一名 **嵌入式软件工程师** 与 **具身智能探索者**。我不仅关注单点技术的实现，更侧重于构建从「底层驱动 + 运动控制」到「ROS 系统集成 + 学习型策略」的**完整机器人工程链路**，尤其是在非结构化的农业自动化场景下的落地应用。

## 🎯 当前研究与重点方向

* **六轴机械臂运控**：基于 MDH 建模、正/逆运动学求解及轨迹规划。
* **具身智能 (Embodied AI)**：探索模仿学习（IL）与强化学习（RL）在真实硬件（LeRobot / ACT / SmolVLA）上的部署。
* **嵌入式架构设计**：专注于现代 C++、分层架构（PIMPL, CRTP）以及高可靠性 RTOS 系统的重构。
* **机器人系统集成**：深度使用 ROS/ROS2 与 MoveIt 进行复杂任务调度与感知规划。

## 🧩 技术栈

### 🔹 编程语言
<div class="about-badges">
  <img src="https://img.shields.io/badge/-C-000000?style=flat-square&logo=c&logoColor=white" alt="C" />
  <img src="https://img.shields.io/badge/-C++-5C3EE8?style=flat-square&logo=cplusplus&logoColor=white" alt="C++" />
  <img src="https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
</div>

### 🔹 嵌入式系统
<div class="about-badges">
  <img src="https://img.shields.io/badge/-STM32-03234B?style=flat-square" alt="STM32" />
  <img src="https://img.shields.io/badge/-Renesas-CC0000?style=flat-square" alt="Renesas" />
  <img src="https://img.shields.io/badge/-ESP32-E7352C?style=flat-square" alt="ESP32" />
  <img src="https://img.shields.io/badge/-CAN%20Bus-00599C?style=flat-square" alt="CAN Bus" />
  <img src="https://img.shields.io/badge/-RTOS-5C3EE8?style=flat-square" alt="RTOS" />
  <img src="https://img.shields.io/badge/-LVGL-FF6F00?style=flat-square" alt="LVGL" />
  <img src="https://img.shields.io/badge/-Embedded%20Vision-5C3EE8?style=flat-square" alt="Embedded Vision" />
  <img src="https://img.shields.io/badge/-PCB%20Design-00599C?style=flat-square" alt="PCB Design" />
</div>

### 🔹 机器人与控制
<div class="about-badges">
  <img src="https://img.shields.io/badge/-Linux-FCC624?style=flat-square&logo=linux&logoColor=black" alt="Linux" />
  <img src="https://img.shields.io/badge/-CMake-064F8C?style=flat-square&logo=cmake&logoColor=white" alt="CMake" />
  <img src="https://img.shields.io/badge/-ROS1%2F2-22314E?style=flat-square&logo=ros" alt="ROS1/2" />
  <img src="https://img.shields.io/badge/-MATLAB-0076A8?style=flat-square" alt="MATLAB" />
  <img src="https://img.shields.io/badge/-MoveIt1%2F2-FF6F00?style=flat-square" alt="MoveIt1/2" />
  <img src="https://img.shields.io/badge/-Pinocchio-EE7C21?style=flat-square" alt="Pinocchio" />
  <img src="https://img.shields.io/badge/-OpenCV-5C3EE8?style=flat-square&logo=opencv" alt="OpenCV" />
  <img src="https://img.shields.io/badge/-🤗%20LeRobot-E7352C?style=flat-square" alt="LeRobot" />
</div>

### ⏳ 持续学习中
<div class="about-badges">
  <img src="https://img.shields.io/badge/-NVIDIA%20Isaac-76B900?style=flat-square&logo=nvidia&logoColor=white" alt="Isaac" />
  <img src="https://img.shields.io/badge/-Qt-41CD52?style=flat-square&logo=qt&logoColor=white" alt="Qt" />
  <img src="https://img.shields.io/badge/-Rust-000000?style=flat-square&logo=rust" alt="Rust" />
</div>

## 🛠 核心能力与关注点

相比于单纯的 Demo 实现，我更追求系统的**可靠、可维护与可部署性**：
* **工程化架构**：坚持 Clean Architecture，擅长在嵌入式 C 中实现分层解耦与驱动抽象的架构设计、利用现代 C++ 特性优化控制库的抽象能力
* **数学与控制**：熟悉 MDH 建模、正逆运动学（解析+数值解）、刚体动力学（Pinocchio）以及复杂环境下的位姿可达性处理
* **实机验证**：熟悉 linux serial/can 用户态驱动 + ros_control 硬件接口设计，具备从遥操作采集、数据集构建到策略策略训练与推理部署（ACT/SmolVLA）的全流程实机经验

## 🚧 参与项目

* **🦾 番茄采摘机器人 (Tomato-Picker-PiPER)**：基于 STM32 + ROS + MoveIt 的精准农业项目；负责机械臂底层驱动、运动学解算及 ROS 控制链路集成
* **🤝 双臂 IL + RL 协同系统 (Dual-DM-Arm-LeRobot)**：基于 LeRobot 与 ROS2，研究模仿学习与强化学习在真实农业机械臂协作场景下的策略部署
* **🐦 鸽笼自动换料系统**：将传统的裸机控制架构重构为基于 RTOS 的多任务调度系统，显著提升了系统的稳定性与响应速度
* **🚗 舵轮轮轨一体底盘**：负责农业移动平台的转向控制、运动学建模以及通信协议设计，实现复杂地形下的精准移动

## 📌 联系方式

* **Blog**: [kaede-rei.github.io](https://kaede-rei.github.io/)
* **GitHub**: [@Kaede-Rei](https://github.com/Kaede-Rei)
* **Email**: [kaerei86@gmail.com](mailto:kaerei86@gmail.com)

---

## 📊 GitHub 统计

<div class="about-stats">
  <a href="https://github.com/anuraghazra/github-readme-stats">
    <img alt="Kaede-Rei 的 Github 统计" src="https://github-readme-stats-flame-gamma-74.vercel.app/api/?username=Kaede-Rei&show_icons=true&count_private=true&theme=default&hide_border=true&bg_color=fff&title_color=00E676&icon_color=00E676" />
  </a>
  <a href="https://github.com/anuraghazra/github-readme-stats">
    <img alt="Kaede-Rei 的常用语言" src="https://github-readme-stats-flame-gamma-74.vercel.app/api/top-langs/?username=Kaede-Rei&langs_count=8&layout=compact&theme=default&hide_border=true&bg_color=fff&title_color=000" />
  </a>
</div>

<div class="about-graph">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=Kaede-Rei&theme=react-dark&hide_border=true" alt="贡献图" style="width: 100%;" />
</div>
