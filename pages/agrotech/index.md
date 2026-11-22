---
title: AgroTech Innovation Lab
titleTemplate: AgroTech Innovation Lab（ATIL）· Kaede Rei
description: AgroTech 智能机械协会的公开项目、工程资料与学习路线
summary: AgroTech Innovation Lab（ATIL）的公开项目、工程资料与学习入口，涵盖农业机器人、智能装备与具身智能
ogImage: /images/brand/atil-share.png
layout: association
comment: false
---

<script setup>
import { association, historicalProjects, profile, projects } from '../../data/site'
</script>

## 我在 ATIL 的工作

<p>我是 {{ association.organization }} 的{{ profile.associationRole }}，参与项目组织与开发，主要关注机械臂控制、嵌入式软件和系统集成，也为后续项目整理公共模块、接口文档与学习材料</p>

## 公开工作方向

### 控制与系统工具

围绕机械臂、底盘和各类设备，整理控制模块、标定工具、子系统接口与任务编排流程

### 感知与机器人应用

围绕农业作业与机器人实验开展视觉、运动执行、三维采集和系统集成

### 工程资料与学习

维护公共 SDK、工程规范、模型和仿真资料，整理成员学习与协作入口

## 精选公开工程

<KaedeProjectIndex :projects="[projects.robotStudio, projects.calibration, projects.embeddedSdk, projects.scanner, projects.longinus]" show-details />

<p><a :href="projects.serialArm.url">{{ projects.serialArm.title }} / SerialArm Studio</a> 是我在个人仓库维护的串联机械臂控制内核与桌面工作台</p>

## 农业机器人与感知项目导航

完整方向见 <a :href="association.projectNavigation">GitHub 组织项目导航</a>，其中「待补充公开仓库」表示尚未登记公开仓库链接

- 樱桃番茄机器人的[感知](https://github.com/AgroTech-SCAU/Tomato-Perception)与[机械臂作业](https://github.com/AgroTech-SCAU/Tomato-Manipulation)
- [采茶双臂机器人](https://github.com/AgroTech-SCAU/Tea-Picking-Dual-Arm)
- [荔枝花穗视觉项目](https://github.com/AgroTech-SCAU/LycheeFlower-Vision)
- [轮轨一体化底盘](https://github.com/AgroTech-SCAU/Wheel-Rail-Integrated-Chassis)

## 公共技术资产

- [机械臂运控规范](https://github.com/AgroTech-SCAU/Robotic-Arm-Motion-Control-Standard)涵盖机械臂运动控制的工程约定与参考结构，Draft v0.4 正在迁移试用
- [仓库模板](https://github.com/AgroTech-SCAU/AgroTech-Repository-Template)提供公开工程的起始目录与协作资料
- [ATIL-Skills](https://github.com/AgroTech-SCAU/ATIL-Skills)由协会维护，收录通知与回复、工作汇报与安排的 AI Agent Skills
- [模型资料](https://github.com/AgroTech-SCAU/Competition-Robot-2026-Model-Collection)收录比赛机器人的模型与工程资料
- [Gazebo 资源](https://github.com/AgroTech-SCAU/gazebo-SSR)提供公开仿真资源

## 比赛与历史积累

比赛和早期工程的代码与模型保留供参考

[查看比赛项目集合](https://github.com/AgroTech-SCAU/Competition-Robot-Collection)

<KaedeProjectIndex :projects="historicalProjects" />

## 从学习路线开始

两条路线按阶段列出可阅读、更新中和规划中的章节

- [查看电控学习路径](/learning-path/electrical-control)
- [查看机械臂运控学习路径](/learning-path/arm-motion-control)

## 参与讨论

技术问题可在对应公开仓库讨论，更多项目见 <a :href="association.githubOrg">AgroTech-SCAU 的 GitHub 主页</a>，我的联系方式见[关于页](/about)
