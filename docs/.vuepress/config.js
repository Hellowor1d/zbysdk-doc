module.exports = {
    // home: true,
    title: 'zby-live-sdk',
    description: '在线教室一整套解决方案',
    configureWebpack: {
        resolve: {
          alias: {
            '@alias': '../../assets/'
          }
        }
      },
      themeConfig: {
        // sidebar: {
        // //   '/foo/': [
        // //     '',     /* /foo/ */
        // //     'one',  /* /foo/one.html */
        // //     'two'   /* /foo/two.html */
        // //   ],
    
        // //   '/bar/': [
        // //     '',      /* /bar/ */
        // //     'three', /* /bar/three.html */
        // //     'four'   /* /bar/four.html */
        // //   ],
    
        // //   // fallback
        // //   '/': [
        // //     '',        /* / */
        // //     'contact', /* /contact.html */
        // //     'about'    /* /about.html */
        // //   ]
        // }
      },
      markdown: {
        // markdown-it-anchor 的选项
        anchor: { permalink: true },
        // markdown-it-toc 的选项
        toc: { includeLevel: [1, 2] },
        config: md => {
          // 使用更多的 markdown-it 插件!
        //   md.use(require('markdown-it-xxx'))
        }
      },
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/' },
          { text: '配置', link: '/config/' },
          { text: 'API 参考', link: '/api/' },
          { text: 'External', link: 'https://www.npmjs.com/package/zby-live-sdk' },
        ]
      }
  }