export const robotArmDevelopmentPath = '/learning-path/robot-arm-development'
export const robotArmDevelopmentReferencesPath = `${robotArmDevelopmentPath}/phase-4/references`

export const robotArmDevelopmentTrack = {
  title: '机械臂系统开发',
  path: robotArmDevelopmentPath,
  description: '从机械臂本体设计、软件开发与外设接入，走到仿真验证和实机部署',
  referencesLink: robotArmDevelopmentReferencesPath,
  phases: [
    {
      id: 'phase-1',
      title: '一、机械臂本体设计',
      overviewLink: `${robotArmDevelopmentPath}/phase-1`,
      audience: '机械臂系统与运动控制开发者',
      description: '根据作业任务确定构型、结构和驱动，核对几何与动力学模型，再通过装配和实物测量验证',
    },
    {
      id: 'phase-2',
      title: '二、机械臂软件开发',
      overviewLink: `${robotArmDevelopmentPath}/phase-2`,
      audience: '负责机械臂软件、运动控制与系统集成的开发者',
      description: '从软件架构、设备接口和实时运行入手，贯通建模、控制、规划、任务、学习、仿真与实机部署',
    },
    {
      id: 'phase-3',
      title: '三、机械臂外设开发',
      overviewLink: `${robotArmDevelopmentPath}/phase-3`,
      audience: '负责机械臂外设接入、标定与联调的开发者',
      description: '明确视觉设备、末端工具、示教装置和辅助设备的接口与运行条件，完成系统联调和任务验证',
    },
    {
      id: 'phase-4',
      title: '附录',
      overviewLink: `${robotArmDevelopmentPath}/phase-4`,
      audience: '需要选择运行架构或安排仿真实践的开发者',
      description: '对照三种运行架构下的章节实现分工和实施路线，查阅仿真平台实践与全书参考资料',
    },
  ],
}
