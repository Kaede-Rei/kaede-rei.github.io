---
title: 基于 micromamba 构建移动环境 
date: 2026-04-08
updated: 2026-04-08
categories: 笔记
tags:
  - 环境配置
top: 2
cover: /images/covers/anon.jpg
---

## 1. 引言

在机器人项目开发中，环境的一致性与物理媒介的限制往往是影响工程效率的关键因素；在实际开发过程中，主要会有两个跨环境需求：

- 宿主环境与生产环境的代差：生产环境（工控机）运行于 Ubuntu 20.04，而个人主机已迁移至 Ubuntu 22.04；由于 ROS1 Noetic 并非 22.04 的原生适配版本，无法直接在宿主机上构建生产环境的开发环境
- 硬件资源约束与多设备协作：个人主机一个是磁盘空间不足，另一个是考虑到项目协同；例如在 LeRobot 等大容量深度学习环境与旧系统 ROS 实验环境的情况下，需要在公用的移动硬盘上构建多个独立的开发环境，并能够在不同设备间无缝迁移

### 为什么选择了 micromamba？

micromamba 是一个轻量级的包管理器，具有以下优势：

- 完全的隔离性：通过将虚拟环境、源码、构建产物及脚本边界彻底分开，确保实验性依赖不会破坏宿主机稳定性
- 极致的移动性：不同于 conda/miniconda/miniforge 等环境管理工具，micromamba 可以将整个 Conda Root 路径部署在移动硬盘中；通过定制化的 “激活脚本” 与 “设备切换脚本”，实现环境在不同主机间的即插即用，消除了对宿主机固定路径的依赖
- 可持续的开发工作流：这并非单纯追求标准的软件安装，而是围绕项目可持续性所做的“环境工程选择”，确保了从 Ubuntu 22.04 开发到 20.04 部署的无缝衔接

## 2. ROS + MoveIt! 环境构建

在 Ubuntu 22.04 上可以用 [RoboStack](https://robostack.github.io/) 构建 ROS Noetic 环境；并经过实测可以构建 ROS Noetic + MoveIt! 的完整环境，主要步骤如下：

### 2.1. 安装 micromamba 并编写激活脚本+设备切换脚本

此处不再赘述，这里主要提供一个示例的激活脚本与设备切换脚本：

- 激活脚本 `activate.sh`：
```bash
```

- 设备切换脚本 `switch_device.sh`：
```bash
```

在移动硬盘接入新设备后，运行 `switch_device.sh` 脚本即可自动调整环境配置，使其适配当前设备的路径结构，之后在未更换设备的情况下，直接运行 `activate.sh` 即可激活环境，无需担心路径问题

### 2.2. 构建 ROS Noetic + MoveIt! 环境

#### 2.2.1. 创建 micromamba 环境

```bash
# create a ros env and install the dependencies
micromamba create -n ros_env -c conda-forge -c robostack-noetic \
    ros-noetic-desktop-full \
    ros-dev-tools \
    ros-noetic-moveit \
    ros-noetic-trac-ik-kinematics-plugin \
    ros-noetic-rosserial \
    ros-noetic-rosserial-python \
    compilers cxx-compiler c-compiler \
    binutils sysroot_linux-64
```

#### 2.2.2. 激活 micromamba 环境

这里需要先运行 `switch_device.sh` 脚本确保环境配置正确，然后运行 `activate.sh` 激活环境：

#### 2.2.3. 使用 micromamba 的 gcc 编译工作空间

注意到 micromamba 环境中的 gcc 可能与系统默认的 gcc 版本不同；在 ROS Noetic 的环境中，建议使用 micromamba 提供的 gcc 版本以确保兼容性；这里提供一个示例脚本用于切换到 micromamba 的 gcc：

```bash
#!/bin/bash
# This script sets up the environment variables for using the compilers from the conda environment in ROS.
# Usage:
#   source ./use-mamba-gcc.sh
#   . ./use-mamba-gcc.sh

export CC=$CONDA_PREFIX/bin/x86_64-conda-linux-gnu-cc
export CXX=$CONDA_PREFIX/bin/x86_64-conda-linux-gnu-c++
export LD_LIBRARY_PATH=$CONDA_PREFIX/lib:$LD_LIBRARY_PATH
export LIBRARY_PATH=$CONDA_PREFIX/lib:$LIBRARY_PATH
export CMAKE_PREFIX_PATH=$CONDA_PREFIX:$CMAKE_PREFIX_PATH
export PATH=$CONDA_PREFIX/bin:$PATH

echo "----------------------------------------"
echo "Using compilers from conda environment:"
which gcc
which g++
echo "C is set to: $CC"
echo "C++ is set to: $CXX"
echo "----------------------------------------"
```

然后在每次激活环境后+编译工作空间前都先激活环境中的 gcc，并且要保证 cmake 失能测试+调整最小版本：

```bash
# activate the gcc of micromamba environment
. ./ros_env/use-mamba-gcc.sh
# build the catkin workspace
catkin_make -DCATKIN_ENABLE_TESTING=OFF -DCMAKE_POLICY_VERSION_MINIMUM=3.5
```

## 3. 其他环境

其他环境就和平时使用环境管理工具一样使用，只要记得用定制脚本切换设备与激活环境即可
