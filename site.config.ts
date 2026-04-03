import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://kaede-rei.github.io/',
  lang: 'zh-CN',
  title: 'Kaede Rei の 小 窝',
  favicon: '/favicon.svg',

  author: {
    name: 'Kaede Rei',
    avatar: '/images/soyo.png',
    intro: '智能农业机器人 / 机械臂 / ROS / 嵌入式',
  },
  description: 'Kaede Rei 的技术博客与学习路径',

  social: [
    {
      name: 'GitHub',
      link: 'https://github.com/Kaede-Rei',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/24410561',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'X',
      link: 'https://x.com/你的用户名',
      icon: 'i-ri-twitter-x-fill',
      color: '#111111',
    },
    {
      name: 'E-Mail',
      link: 'mailto:kaerei@foxmail.com',
      icon: 'i-ri-mail-line',
      color: '#8E71C1',
    },
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
  ],

  search: {
    enable: true,
    provider: 'fuse',
  },
})