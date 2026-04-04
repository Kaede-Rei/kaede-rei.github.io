import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'sakura',

  themeConfig: {
    ui: {
      primary: '#ffaf4ef1',

      pageHeader: {
        image: {
          overlay: true,
          overlayColor: 'rgba(0, 0, 0, 0.8)',
          overlayOpacityInitial: 0.45,
          overlayOpacity: 0.58,
        },
      },

      postList: {
        responsive: {
          '2xl': 1,
          xl: 1,
          lg: 1,
          md: 1,
          sm: 1,
        },
      },
    },

    hero: {
      title: 'Kaede Rei の 小 窝',
      motto: '嵌入式、机械臂、ROS 农业机器人',
      urls: [
        '/images/hero/ansy.png',
      ],
      randomUrls: false,
      style: 'dim',
      fixedImg: false,
      typewriter: true,
      enableHitokoto: true,
      waveTheme: 'fish',
      socialStyle: 'single',
    },

    notice: {
      message: '<b>这里是 Kaede Rei 的技术博客与学习记录。</b>',
    },

    pinnedPost: {
      text: 'Start Here',
      entries: [
        {
          title: 'About Me',
          desc: '关于我的介绍',
          link: '/about',
          img: '/images/pinned/about.png',
        },
        {
          title: '学习路径',
          desc: 'AgroTech 协会培养路线',
          link: '/learning-path',
          img: '/images/pinned/path.jpg',
        },
        {
          title: 'GitHub',
          desc: '我的 GitHub 仓库',
          link: 'https://github.com/Kaede-Rei',
          img: '/images/pinned/github.png',
        },
      ],
    },

    pagination: {
      animation: false,
      infiniteScrollOptions: {
        preload: false,
      },
    },

    postFooter: {
      navigationMerge: true,
    },

    navbar: [
      { text: '首页', link: '/', icon: 'i-ri-home-4-line' },
      { text: '分类', link: '/categories', icon: 'i-ri-folder-2-line' },
      { text: '归档', link: '/archives', icon: 'i-ri-archive-line' },
      { text: '标签', link: '/tags', icon: 'i-ri-price-tag-3-line' },
      {
        text: '学习路径',
        link: '/learning-path',
        icon: 'i-ri-road-map-line',
        items: [
          { text: '电控组', link: '/learning-path/electrical-control', icon: 'i-ri-cpu-line' },
          { text: '机械臂运控组', link: '/learning-path/arm-motion-control', icon: 'i-ri-robot-2-line' },
        ],
      },
      { text: '关于', link: '/about', icon: 'i-ri-user-3-line' },
      { text: '友情链接', link: '/links', icon: 'i-ri-links-line' },
    ],

    navbarOptions: {
      title: ['Kaede', 'Rei'],
      subTitle: 'Embedded / Arm / Agri Robot',
      invert: ['home'],
      autoHide: ['home'],
      showMarker: false,
    },

    postList: {
      text: 'Notes Lists',
      isImageReversed: true,
      defaultImage: [
        '/images/covers/anon.png',
      ],
    },

    layout: {
      general: {
        layout: 'triple-columns',
        sidebar: {
          left: [
            'SakuraSidebarSiteInfo',
            'SakuraSidebarCategories',
          ],
          right: [],
        },
      },
    },

    tags: {
      rainbow: true,
    },

    scrollToTop: true,
    scrollIndicator: false,
    scrollLock: false,

    footer: {
      since: 2026,
    },
  },
})
