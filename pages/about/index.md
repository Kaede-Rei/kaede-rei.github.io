---
title: 关于 Kaede Rei
titleTemplate: 关于 Kaede Rei
description: Kaede Rei 是华南农业大学本科生、机器人开发者、AgroTech-SCAU 主要负责人之一，关注机械臂控制、机器人嵌入式系统与系统集成
summary: Kaede Rei 的机器人项目和联系方式，涵盖机械臂控制、嵌入式系统与系统集成
markdownClass: about-page
comment: false
---

<script setup>
import { association, featuredProjects, profile, projects } from '../../data/site'
</script>

<p class="about-intro">
  <img :src="profile.avatar" alt="" width="96" height="96">
  <span>我是 {{ profile.name }}，{{ profile.school }}本科生、{{ profile.role }}，也是 {{ association.organization }} 的{{ profile.associationRole }}</span>
</p>

## 开发方向

- 机械臂方向关注模型、驱动、控制与标定在可调试工具中的实现
- 嵌入式方向参与通信、设备抽象与控制开发，整理可跨项目复用的模块
- 系统集成方向通过接口、配置与状态管理串起设备、软件模块与任务流程

我也在探索双臂遥操作、示教数据与模仿学习的训练和部署

<span id="参与项目"></span>

## 相关项目 {#projects}

<KaedeProjectIndex :projects="[...featuredProjects, projects.calibration, projects.dualArm, projects.atlas, projects.longinus]" show-owners />

## 我在 ATIL 的工作

我参与 AgroTech-SCAU 的项目组织与开发，持续整理公共模块、工程文档与学习材料

<RouterLink class="about-association" :to="association.path">
  <ATILBrand variant="compact" decorative />
  <span>了解 ATIL</span>
</RouterLink>

## 阅读与交流

技术笔记记录设计取舍和调试过程，学习路径按阶段整理并持续更新相关基础与工具

技术问题可以在对应公开仓库讨论，也可以通过邮箱联系我

<ul>
  <li>GitHub <a :href="profile.github">{{ profile.githubHandle }}</a></li>
  <li>邮箱 <a :href="`mailto:${profile.email}`">{{ profile.email }}</a></li>
  <li>文章订阅 <a :href="profile.rss">RSS</a></li>
</ul>

<style scoped>
.about-intro {
  display: flex;
  align-items: center;
  gap: 16px;
}

.about-intro img {
  display: block;
  flex: none;
  width: clamp(64px, 11vw, 96px);
  height: auto;
  margin: 0;
  border-radius: 50%;
}

.about-association {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.about-association :deep(.atil-brand-mark) {
  --mark-size: 44px;
}
</style>
