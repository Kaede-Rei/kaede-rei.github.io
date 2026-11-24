---
title: 我在 ATIL 的工作
titleTemplate: 我在 ATIL 的工作 · Kaede Rei
description: Kaede Rei 在 AgroTech Innovation Lab 参与的机械臂控制、嵌入式软件与系统集成工程
summary: Kaede Rei 在 ATIL 的工作及相关组织项目，涵盖机械臂控制、嵌入式软件与系统集成
ogImage: /images/brand/atil-share.png
layout: association
comment: false
---

<script setup>
import { association, projects } from '../../data/site'
import { vViewportEntrance } from '../../theme/utils/viewport-entrance'
</script>

## 相关工程 {#精选公开工程}

<div id="控制与系统工具">
  <KaedeProjectIndex :projects="[projects.robotStudio, projects.embeddedSdk, projects.longinus]" show-owners show-details />
</div>

## 组织项目与资料 {#农业机器人与感知项目导航}

<div>
<p v-viewport-entrance="'editorial'" id="感知与机器人应用">完整项目见 <a :href="association.projectNavigation">AgroTech-SCAU 的 GitHub 项目导航</a></p>

<p v-viewport-entrance="'editorial'" id="公共技术资产"><span id="工程资料与学习" aria-hidden="true"></span>组织维护的<a href="https://github.com/AgroTech-SCAU/Robotic-Arm-Motion-Control-Standard">机械臂运控规范</a>为 Draft v0.4，正在迁移试用</p>

<p v-viewport-entrance="'editorial'" id="比赛与历史积累"><a :href="projects.atlas.url">{{ projects.atlas.title }}</a> 是仍开放的历史软件基线，<a :href="projects.mk1.url">{{ projects.mk1.title }}</a> 和 <a :href="projects.hephaestus.url">{{ projects.hephaestus.title }}</a> 已归档</p>

<p v-viewport-entrance="'editorial'" id="参与讨论"><span id="从学习路线开始" aria-hidden="true"></span>技术问题可在对应公开仓库讨论，我的联系方式见 <RouterLink to="/about">关于页</RouterLink></p>
</div>
