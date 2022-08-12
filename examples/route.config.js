// 官网页面侧边栏导航
import navConfig from './nav.config';
import langs from './i18n/route';

// examples/pages 目录下的翻译文件，是通过 build/bin/i18n.js 生成的。
const LOAD_MAP = {
  'zh-CN': name => {
    // 路由懒加载，这里是旧的写法，相当于
    // () => import(/* webpackChunkName: "zh-CN" */`./pages/zh-CN/${name}.vue`)
    return r => require.ensure([], () =>
      r(require(`./pages/zh-CN/${name}.vue`)),
    'zh-CN');
  },
  'en-US': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/en-US/${name}.vue`)),
    'en-US');
  },
  'es': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/es/${name}.vue`)),
    'es');
  },
  'fr-FR': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/fr-FR/${name}.vue`)),
    'fr-FR');
  }
};
const load = function(lang, path) {
  return LOAD_MAP[lang](path);
};

const LOAD_DOCS_MAP = {
  'zh-CN': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/zh-CN${path}.md`)),
    'zh-CN');
  },
  'en-US': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/en-US${path}.md`)),
    'en-US');
  },
  'es': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/es${path}.md`)),
    'es');
  },
  'fr-FR': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/fr-FR${path}.md`)),
    'fr-FR');
  }
};

const loadDocs = function(lang, path) {
  return LOAD_DOCS_MAP[lang](path);
};

const registerRoute = (navConfig) => {
  let route = [];
  // lang: zh-CN
  Object.keys(navConfig).forEach((lang, index) => {
    let navs = navConfig[lang];
    // 官网页面顶部导航【组件】对应的页面
    route.push({
      path: `/${ lang }/component`,
      redirect: `/${ lang }/component/installation`,
      component: load(lang, 'component'),
      children: []
    });
    navs.forEach(nav => {
      if (nav.href) return; // 侧边栏【Element React】【Element Angular】2个外链，这里不注册路由
      if (nav.groups) { // 侧边栏【组件】下的导航
        nav.groups.forEach(group => {
          group.list.forEach(nav => { // nav 2个属性 {path,title}
            addRoute(nav, lang, index);
          });
        });
      } else if (nav.children) { // 侧边栏【开发指南】下的导航
        nav.children.forEach(nav => {
          addRoute(nav, lang, index);
        });
      } else {
        addRoute(nav, lang, index);
      }
    });
  });
  function addRoute(page, lang, index) {
    const component = page.path === '/changelog'
      ? load(lang, 'changelog')
      : loadDocs(lang, page.path);
    let child = {
      path: page.path.slice(1), // 去掉 /
      meta: {
        title: page.title || page.name, // 侧边栏【组件】下的导航都是 title,【开发指南】下的导航都是 name
        description: page.description, // 多余的，目前没有该属性
        lang
      },
      // 前缀用来判断是在那个页面导航中，多个地方都会用到
      name: 'component-' + lang + (page.title || page.name),
      // webpack 处理 import(xxx) 时，会放到 default 属性上。
      // https://webpack.docschina.org/guides/code-splitting/#dynamic-imports
      component: component.default || component
    };

    route[index].children.push(child);
  }

  return route;
};

let route = registerRoute(navConfig);

const generateMiscRoutes = function(lang) {
  // 官网页面顶部导航【指南】对应的页面
  let guideRoute = {
    path: `/${ lang }/guide`, // 指南
    redirect: `/${ lang }/guide/design`,
    component: load(lang, 'guide'),
    children: [{
      path: 'design', // 设计原则
      name: 'guide-design' + lang,
      meta: { lang },
      component: load(lang, 'design')
    }, {
      path: 'nav', // 导航
      name: 'guide-nav' + lang,
      meta: { lang },
      component: load(lang, 'nav')
    }]
  };

  // 官网页面顶部导航【主题】对应的页面
  let themeRoute = {
    path: `/${ lang }/theme`,
    component: load(lang, 'theme-nav'),
    children: [
      {
        path: '/', // 主题管理
        name: 'theme' + lang,
        meta: { lang },
        component: load(lang, 'theme')
      },
      {
        path: 'preview', // 主题预览编辑
        name: 'theme-preview-' + lang,
        meta: { lang },
        component: load(lang, 'theme-preview')
      }]
  };

  // 官网页面顶部导航【资源】对应的页面
  let resourceRoute = {
    path: `/${ lang }/resource`, // 资源
    meta: { lang },
    name: 'resource' + lang,
    component: load(lang, 'resource')
  };

  // 官网首页
  let indexRoute = {
    path: `/${ lang }`, // 首页
    meta: { lang },
    name: 'home' + lang,
    component: load(lang, 'index')
  };

  return [guideRoute, resourceRoute, themeRoute, indexRoute];
};

langs.forEach(lang => {
  // lang.lang: zh-CN
  route = route.concat(generateMiscRoutes(lang.lang));
});

route.push({
  path: '/play',
  name: 'play',
  component: require('./play/index.vue')
});

let userLanguage = localStorage.getItem('ELEMENT_LANGUAGE') || window.navigator.language || 'en-US';
let defaultPath = '/en-US';
if (userLanguage.indexOf('zh-') !== -1) {
  defaultPath = '/zh-CN';
} else if (userLanguage.indexOf('es') !== -1) {
  defaultPath = '/es';
} else if (userLanguage.indexOf('fr') !== -1) {
  defaultPath = '/fr-FR';
}

route = route.concat([{
  path: '/',
  redirect: defaultPath
}, {
  path: '*',
  redirect: defaultPath
}]);

export default route;
