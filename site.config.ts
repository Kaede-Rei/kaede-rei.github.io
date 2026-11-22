import { defineSiteConfig } from 'valaxy'
import { legacyArmRedirects } from './data/redirects'
import { profile } from './data/site'

export default defineSiteConfig({
  url: profile.url,
  lang: 'zh-CN',
  pageSize: 6,
  languages: ['zh-CN'],
  title: profile.siteTitle,
  favicon: '/images/brand/atil-mark.png',

  author: {
    name: profile.name,
    link: profile.github,
    avatar: profile.avatar,
    email: profile.email,
    intro: profile.intro,
  },
  description: profile.description,

  excerpt: {
    auto: true,
    length: 180,
    type: 'html',
  },

  social: [
    {
      name: 'GitHub',
      link: profile.github,
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '哔哩哔哩',
      link: profile.bilibili,
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'E-Mail',
      link: `mailto:${profile.email}`,
      icon: 'i-ri-mail-line',
      color: '#8E71C1',
    },
    {
      name: 'RSS',
      link: profile.rss,
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
  ],

  search: {
    enable: true,
    provider: 'fuse',
  },

  redirects: {
    useVueRouter: false,
    rules: legacyArmRedirects,
  },
})
