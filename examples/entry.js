/*
  官网项目的入口，就是一个普通的 vue 项目。
*/
import Vue from 'vue';
import entry from './app';
import VueRouter from 'vue-router';
// main 是 /src 目录，bin/config.js 定义了别名
// 这里全量引入了 Element 组件，所以在官网项目中是可以用的。examples/play/index.vue 就是用来测试和展示组件使用效果的。
import Element from 'main/index.js';
import hljs from 'highlight.js';
import routes from './route.config';
// 用于展示各个组件使用效果，只在 build/md-loader/containers.js 中用到
import demoBlock from './components/demo-block';
// footer，除了组件页面外都有，只在 examples/app.vue 中用到
import MainFooter from './components/footer';
// 顶部导航栏，只在 examples/app.vue 中用到，
import MainHeader from './components/header';
// 侧边栏，组件和指南页面的模板文件中用到
// examples/pages/template/component.tpl
// examples/pages/template/guide.tpl
import SideNav from './components/side-nav';
// 组件页面的 footer，只在这里用到 examples/pages/template/component.tpl
import FooterNav from './components/footer-nav';
import title from './i18n/title';

import 'packages/theme-chalk/src/index.scss';
// 和 demoBlock 组件配套使用，用于展示不同组件的页面效果的样式。
import './demo-styles/index.scss';
// 公共样式
import './assets/styles/common.css';
// 字体样式
import './assets/styles/fonts/style.css';
// 通过 build/bin/iconInit.js 生成
import icon from './icon.json';

Vue.use(Element);
Vue.use(VueRouter);
// 全局注册组件
Vue.component('demo-block', demoBlock);
Vue.component('main-footer', MainFooter);
Vue.component('main-header', MainHeader);
Vue.component('side-nav', SideNav);
Vue.component('footer-nav', FooterNav);

const globalEle = new Vue({
  data: { $isEle: false } // 是否 ele 用户
});

Vue.mixin({
  computed: {
    $isEle: {
      get: () => (globalEle.$data.$isEle),
      set: (data) => {globalEle.$data.$isEle = data;}
    }
  }
});

Vue.prototype.$icon = icon; // Icon 列表页用

const router = new VueRouter({
  mode: 'hash',
  // 因为 examples 是一个 vue 项目，所以基路径以它的目录为准 https://v3.router.vuejs.org/zh/api/#base
  base: __dirname,
  routes
});

router.afterEach(route => {
  // https://github.com/highlightjs/highlight.js/issues/909#issuecomment-131686186
  Vue.nextTick(() => {
    const blocks = document.querySelectorAll('pre code:not(.hljs)');
    Array.prototype.forEach.call(blocks, hljs.highlightBlock);
  });
  // 通过顶部导航栏对应的页面翻译，来设置 document.title
  /*
    data = {
      "home": "Element - 网站快速成型工具",
      "guide": "指南 | Element",
      "component": "组件 | Element",
      "resource": "资源 | Element"
    }
  */
  const data = title[route.meta.lang];
  // 所有子页面和父页面保持一致。比如组件页面的任何一个组件，document.title 都是 (组件 | Element)
  for (let val in data) {
    if (new RegExp('^' + val, 'g').test(route.name)) {
      document.title = data[val];
      return;
    }
  }
  document.title = 'Element';
  ga('send', 'event', 'PageView', route.name);
});

new Vue({ // eslint-disable-line
  ...entry,
  router
}).$mount('#app');
