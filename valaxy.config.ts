// import type { ThemeUserConfig } from 'valaxy-theme-sakura'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'sakura',

  themeConfig: {
    ui: {
        primary: '#ff4e6a',
    },

    hero: {
        title: 'Kaede Rei の 小 窝',
        motto: '嵌入式、机械臂、ROS 农业机器人',
        urls: [
          '/videos/hero/ansy.mp4',
        ],
        randomUrls: true,
        style: 'dim',
        fixedImg: true,
        typewriter: true,
        enableHitokoto: true,
        waveTheme: 'fish',
        socialStyle: 'single'
    },

    notice: {
        message: '<b>这里是 Kaede Rei 的技术博客与学习记录。</b>',
    },

    navbar: [
        { text: '首页', link: '/' },
        { text: '分类', link: '/categories' },
        { text: '归档', link: '/archives' },
        { text: '标签', link: '/tags' },
        { text: '学习路径', link: '/learning-path' },
        { text: '关于', link: '/about' },
        { text: '友情链接', link: '/links' },
    ],

    navbarOptions: {
        title: ['Kaede', 'Rei'],
        subTitle: 'Embedded / Arm / Agri Robot',
        invert: ['home'],
        autoHide: ['home'],
        showMarker: false,
    },

    layout: {
      general: {
        layout: 'triple-columns',
        sidebar: {
          left: [
            'SakuraSidebarSiteInfo',
            'SakuraSidebarCategories',
            'SakuraSidebarTags',
            'SakuraSidebarLinks',
          ],
          right: [
            'SakuraSidebarLatestPosts',
          ],
        },
      },
      home: {
        layout: 'triple-columns',
        sidebar: {
          left: [
            'SakuraSidebarSiteInfo',
            'SakuraSidebarCategories',
            'SakuraSidebarTags',
            'SakuraSidebarLinks',
          ],
          right: [
            'SakuraSidebarLatestPosts',
          ],
        },
      },
    },

    tags: {
      rainbow: true,
    },

    scrollToTop: true,
    scrollIndicator: true,
    scrollLock: false,

    footer: {
      since: 2026,
    },
  },
})