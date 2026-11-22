---
title: "参考资料"
layout: technical-doc
contentType: learning-reference
track: robot-arm-development
order: 4
parentLink: "/learning-path/robot-arm-development/phase-4"
summary: "机械臂系统开发各章引用的官方文档、研究论文和技术资料"
phase: phase-4
---

- **urdf** · Open Robotics [URDF 物理与碰撞属性](https://github.com/ros2/ros2_documentation/blob/rolling/source/Capabilities/Simulation/URDF/Adding-Physical-and-Collision-Properties-to-a-URDF-Model.rst) 对应质量、惯性坐标与碰撞描述
- **drive** · Beckhoff [Cyclic Synchronous Position](https://infosys.beckhoff.com/content/1033/elm72xx/10686513419.html) 对应周期位置命令与驱动内部闭环
- **mit** · CubeMars [执行器控制指南](https://www.cubemars.com/cn/how-to-use-cubemars-actuators.html) 对应厂商混合命令与设备操作语义
- **realtime** · ros2_control [Controller Manager](https://control.ros.org/rolling/doc/ros2_control/controller_manager/doc/userdoc.html) 对应硬件读写、控制更新和实时运行
- **handeye** · MoveIt [Hand-Eye Calibration](https://moveit.picknik.ai/main/doc/examples/hand_eye_calibration/hand_eye_calibration_tutorial.html) 对应相机安装关系与标定实践
- **dynamics** · Pinocchio [刚体动力学算法](https://github.com/stack-of-tasks/pinocchio) 对应运动学、递归动力学与计算接口
- **scene** · MoveIt [Planning Scene](https://moveit.picknik.ai/main/api/html/planning_scene_overview.html) 对应机器人状态、环境与规划信息组织
- **control** · MIT Robotic Manipulation [Manipulator Control](https://manipulation.mit.edu/force.html) 对应模型补偿、任务空间与交互控制
- **hybrid** · Modern Robotics [Hybrid Motion-Force Control](https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-6-hybrid-motion-force-control/) 对应受约束方向与自由方向的力和运动控制
- **trajectory** · Modern Robotics [Point-to-Point Trajectories](https://modernrobotics.northwestern.edu/nu-gm-book-resource/9-1-and-9-2-point-to-point-trajectories-part-1-of-2/) 对应路径、轨迹和时间参数化
- **ruckig** · Ruckig [在线运动生成](https://docs.ruckig.com/) 对应受速度、加速度与加加速度约束的在线轨迹
- **trajectory-controller** · ros2_controllers [Joint Trajectory Controller](https://control.ros.org/master/doc/ros2_controllers/joint_trajectory_controller/doc/userdoc.html) 对应参考插值、硬件接口与执行管理
- **motion-planning** · MoveIt [Motion Planning](https://moveit.picknik.ai/main/doc/concepts/motion_planning.html) 对应规划请求、路径后处理与轨迹输出
- **trajectory-optimization** · MIT Robotic Manipulation [Motion Planning](https://manipulation.mit.edu/trajectories.html) 对应约束求解、路径与轨迹优化
- **hybrid-planning** · MoveIt [Hybrid Planning](https://moveit.picknik.ai/main/doc/concepts/hybrid_planning/hybrid_planning.html) 对应全局规划与持续局部调整
- **task-planning** · PlanSys2 [System Design](https://plansys2.github.io/design/index.html) 对应任务表示、计划生成与计划执行
- **task-constructor** · MoveIt Task Constructor [Basic Concepts](https://moveit.github.io/moveit_task_constructor/basics.html) 对应操作阶段、候选与运动连接
- **act** · ACT [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://tonyzhaozh.github.io/aloha/) 对应示范与动作分块学习
- **diffusion** · Diffusion Policy [Visuomotor Policy Learning via Action Diffusion](https://diffusion-policy.cs.columbia.edu/) 对应动作序列生成与滚动执行
- **vla** · OpenVLA [视觉语言动作模型](https://openvla.github.io/) 对应预训练策略与机器人适配
- **policy** · LeRobot [Policy Deployment](https://huggingface.co/docs/lerobot/main/inference) 对应策略推理与实机执行组织
- **inloop** · MathWorks [SIL and PIL Simulations](https://www.mathworks.com/help/ecoder/ug/software-and-processor-in-the-loop-sil-and-pil-simulation.html) 对应目标代码与参考模型的数值验证
- **hil** · MathWorks [Target Environments and Applications](https://www.mathworks.com/help/rtw/gs/target-environments-and-applications.html) 对应开发端、实时仿真与嵌入式运行环境
- **cmsis** · Arm [CMSIS-DSP](https://arm-software.github.io/CMSIS-DSP/main/) 对应矩阵、滤波、数学与有限资源数值实现
- **tinyml** · Google AI Edge [LiteRT for Microcontrollers](https://developers.google.com/edge/litert/microcontrollers/overview) 对应小型模型转换与目标端推理
- **rtos** · FreeRTOS [Interrupt Management](https://github.com/FreeRTOS/FreeRTOS-Kernel-Book/blob/main/ch07.md) 对应中断、任务和事件传递
- **mujoco** · MuJoCo [Modeling](https://mujoco.readthedocs.io/en/stable/modeling.html) 对应模型、执行器、传动、接触和求解配置
- **gazebo** · Gazebo [ROS 2 Integration](https://gazebosim.org/docs/latest/ros2_integration/) 对应消息桥接与系统联调
- **isaacsim** · NVIDIA [Isaac Sim](https://docs.isaacsim.omniverse.nvidia.com/latest/index.html) 对应资产、物理、传感器与合成数据
- **isaaclab** · NVIDIA [Isaac Lab Actuators](https://docs.nvidia.com/isaaclab/concepts/actuators) 对应执行器模型与物理后端的控制归属
- **motor-sizing** · Kollmorgen [电机选型指南](https://www.kollmorgen.cn/sites/default/files/public_downloads/Application_Sizing_Guide_en-US.pdf) 对应工作循环、峰值持续时间与热负荷校核
- **gear-ratings** · Harmonic Drive [Engineering Data](https://www.harmonicdrive.net/_hd/content/documents/FB_Component.pdf) 对应额定力矩、重复峰值与异常瞬时峰值
- **holding-brake** · Beckhoff [保持制动器说明](https://infosys.beckhoff.com/content/1033/am8100/1333496971.html) 对应保持制动与动态制动的适用条件
- **brake-sequence** · Beckhoff [制动控制说明](https://infosys.beckhoff.com/content/1033/ep7412-x071/21510280971.html) 对应释放、接合延迟与驱动配合
- **spring-compensation** · Drake [JointStiffnessController](https://drake.mit.edu/doxygen_cxx/classdrake_1_1systems_1_1controllers_1_1_joint_stiffness_controller.html) 对应重力、弹簧及其他模型作用的分别处理
- **cable-disturbance** · [dVRK 机械臂重力补偿与线缆扰动研究](https://arxiv.org/abs/2001.06156) 对应弹性线缆附加力与实测修正
- **coe-profile** · EtherCAT Technology Group [EtherCAT 技术介绍](https://www.ethercat.org/en/technology.html) 对应 CoE、对象字典及 PDO／SDO 的适用范围
- **cia402-state** · Texas Instruments [CiA 402 驱动示例](https://software-dl.ti.com/processor-industrial-sw/esd/ind_comms_sdk/am64x/09_02_00_15/docs/am64x/ethercat_slave/example2.html) 对应 EtherCAT 状态机与驱动状态机的区别
- **process-watchdog** · Beckhoff [过程数据看门狗](https://infosys.beckhoff.com/content/1033/ed407x/16317402379.html) 对应通信监控范围与故障动作
- **pinocchio-frames** · Pinocchio [参考系与六维运动表达](https://gepettoweb.laas.fr/doc/stack-of-tasks/pinocchio/devel/doxygen-html/group__pinocchio__multibody.html) 对应 WORLD、LOCAL 和 LOCAL_WORLD_ALIGNED 的参考点与表达基底
- **inertial-parameters** · Pinocchio [动态惯性参数接口](https://gepettoweb.laas.fr/doc/stack-of-tasks/pinocchio/master/doxygen-html/structpinocchio_1_1InertiaTpl.html) 对应质量一阶矩、参考原点惯量及参数转换
- **collision-residuals** · [机器人碰撞检测与观测残差研究](https://www.diag.uniroma1.it/~labrob/pub/papers/TRO_Collision_Dec2017.pdf) 对应模型不确定性、摩擦、噪声及延迟对接触估计的影响
- **anti-windup** · MathWorks [带前馈与串级执行器的抗饱和控制](https://www.mathworks.com/help/simulink/slref/anti-windup-control-using-a-pid-controller.html) 对应实际限制、跟踪与前馈分量的处理
- **lqr** · MIT Underactuated Robotics [Linear Quadratic Regulators](https://underactuated.mit.edu/lqr.html) 对应线性模型、二次代价、状态反馈与工作点线性化
- **speed-scaling** · ros2_controllers [Speed Scaling](https://control.ros.org/master/doc/ros2_controllers/joint_trajectory_controller/doc/speed_scaling.html) 对应设备端与控制器端速度缩放、虚拟轨迹时间及执行进度
- **time-parameterization** · MoveIt [Time Parameterization](https://moveit.picknik.ai/main/doc/examples/time_parameterization/time_parameterization_tutorial.html) 对应路径后处理、重新采样与碰撞复查
- **action-cancellation** · ROS 2 [Actions](https://design.ros2.org/articles/actions.html) 对应动作受理、取消请求、取消处理与最终结果的区别
- **action-representations** · LeRobot [Action Representations](https://huggingface.co/docs/lerobot/main/action_representations) 对应绝对动作、共用参考的相对动作、逐步增量及动作反变换
- **action-chunk-timing** · LeRobot [Real-Time Chunking](https://huggingface.co/docs/lerobot/main/rtc) 对应异步推理时新旧动作块的重叠、延迟与执行衔接
- **tool-electrical** · Universal Robots [工具接口电气规格](https://www.universal-robots.com/manuals/EN/HTML/SW10_7/Content/prod-usr-man/complianceUR20/H_g5_sections/tool_i_o_inst_spec.htm) 对应工具接口的持续电流、短时峰值与启动负载条件，具体限制以所用设备为准
- **camera-timing** · Basler [数据块时间戳](https://docs.baslerweb.com/data-chunks)、[采集时序](https://docs.baslerweb.com/acquisition-timing-information)与[设备时间戳](https://docs.baslerweb.com/timestamp) 对应时间戳事件、触发与曝光延迟、读出及传输和设备时钟复位
- **camera-info** · ROS 2 [CameraInfo 定义](https://raw.githubusercontent.com/ros2/common_interfaces/rolling/sensor_msgs/msg/CameraInfo.msg) 对应原始与校正图像的参数、光学坐标系及采集信息
- **depth-projection** · RealSense [投影与坐标转换说明](https://dev.realsenseai.com/docs/projection-in-realsense-sdk-2-0/) 对应不同图像流的像素空间、光学坐标系、内外参及深度投影
- **input-events** · Linux [手柄输入事件接口](https://docs.kernel.org/input/joydev/joystick-api.html) 对应连接初始化状态与新输入事件的区别，作为设备输入语义的实例
- **tool-lock** · ATI [QC-313 工具快换说明](https://www.ati-ia.com/Products/toolchanger/QC.aspx?ID=QC-313) 对应 Ready-to-Lock 与锁紧、解锁状态的区别，具体确认条件以所用工具为准
- **force-range** · ATI [力／力矩传感器 FAQ](https://www.ati-ia.com/library/documents/FT_FAQ.pdf) 对应校准量程、饱和、机械过载极限与测量有效性的区别
- **conveyor-tracking** · Universal Robots [Conveyor Tracking Setup](https://www.universal-robots.com/manuals/EN/HTML/SW5_24/Content/prod-usr-man/software/PolyScope/content/installation_g5/conveyor_tracking_setup_en.htm) 对应输送方向、编码器比例与线性或旋转输送关系
- **mujoco-simulation** · MuJoCo [Simulation Loop](https://mujoco.readthedocs.io/en/stable/programming/simulation.html#simulation-loop) 对应控制回调、反馈求值、积分器与拆分步进接口的关系
- **isaaclab-installation** · NVIDIA [Isaac Lab 安装与后端组合](https://isaac-sim.github.io/IsaacLab/main/source/isaaclab/installation.html) 对应 Newton、可选 Isaac Sim 集成及运行依赖，实践时应使用与所选版本相匹配的说明
