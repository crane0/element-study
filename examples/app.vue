<template>
  <div id="app" :class="{ 'is-component': isComponent }">
    <main-header v-if="lang !== 'play'"></main-header>
    <div class="main-cnt">
      <router-view></router-view>
    </div>
    <main-footer v-if="lang !== 'play' && !isComponent"></main-footer>
  </div>
</template>

<script>
  // 主要做的语言本地化的处理
  import { use } from 'main/locale';
  // 组件的一些翻译文件
  import zhLocale from 'main/locale/lang/zh-CN';
  import enLocale from 'main/locale/lang/en';
  import esLocale from 'main/locale/lang/es';
  import frLocale from 'main/locale/lang/fr';

  // https://element.eleme.cn/#/zh-CN/component/installation
  // location.hash = '#/zh-CN/component/installation'
  const lang = location.hash.replace('#', '').split('/')[1] || 'zh-CN';
  const localize = lang => {
    switch (lang) {
      case 'zh-CN':
        use(zhLocale);
        break;
      case 'es':
        use(esLocale);
        break;
      case 'fr-FR':
        use(frLocale);
        break;
      default:
        use(enLocale);
    }
  };
  // 可以看到有多个地方都执行了，会影响到 src/locale/index.js 中的 lang 变量，从而影响该文件中其他的方法。
  localize(lang);

  export default {
    name: 'app',

    computed: {
      lang() {
        return this.$route.path.split('/')[1] || 'zh-CN';
      },
      isComponent() {
        return /^component-/.test(this.$route.name || '');
      }
    },
    // 监听切换语言
    watch: {
      lang(val) {
        if (val === 'zh-CN') {
          this.suggestJump();
        }
        localize(val);
      }
    },

    methods: {
      suggestJump() {
        if (process.env.NODE_ENV !== 'production') return;

        const href = location.href;
        const preferGithub = localStorage.getItem('PREFER_GITHUB');
        const cnHref = href.indexOf('eleme.cn') > -1 || href.indexOf('element-cn') > -1 || href.indexOf('element.faas') > -1;
        if (cnHref || preferGithub) return;
        setTimeout(() => {
          if (this.lang !== 'zh-CN') return;
          // 这里已经可以用组件，是因为在 entry.js 中已经引入 Element 了
          this.$confirm('建议大陆用户访问部署在国内的站点，是否跳转？', '提示')
            .then(() => {
              location.replace('https://element.eleme.cn');
            })
            .catch(() => {
              localStorage.setItem('PREFER_GITHUB', 'true'); // 设置一次，拒绝掉后不再提示
            });
        }, 1000);
      }
    },

    mounted() {
      localize(this.lang);
      if (this.lang === 'zh-CN') {
        this.suggestJump();
      }
    }
  };
</script>
