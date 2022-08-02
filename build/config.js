/*
  这是 webpack 的公共配置，比如 externals 和 alias
  externals 防止将某些 import 的包(package)打包到 bundle 中，
    而是在运行时(runtime)再去从外部获取这些扩展依赖(external dependencies)。
    这样可以减少打包后的 bundle 的体积和打包速度。
  参考 https://zhuanlan.zhihu.com/p/115305393
  官方文档 https://webpack.docschina.org/configuration/externals/
*/
var path = require('path');
var fs = require('fs');
/*
  https://github.com/liady/webpack-node-externals
  nodeExternals()是为了排除所有来自node_modules中的模块依赖，只有当使用 require('xxx') 时，才不会被排除。
  个人猜测，是为了避免冗余吗，比如某个依赖没有被使用，就给排除掉，webpack 不做打包。
*/
var nodeExternals = require('webpack-node-externals');
// { "pagination": "./packages/pagination/index.js", }
var Components = require('../components.json');
// ['menu', 'popup', 'after-leave.js', ...]
var utilsList = fs.readdirSync(path.resolve(__dirname, '../src/utils'));
var mixinsList = fs.readdirSync(path.resolve(__dirname, '../src/mixins'));
var transitionList = fs.readdirSync(path.resolve(__dirname, '../src/transitions'));
var externals = {};
/*
  import ElCheckbox from 'element-ui/packages/checkbox' => require('element-ui/lib/checkbox')
  这样的好处是，避免了冗余代码。
  比如在 packages/table/src/table-column.js 组件中，用到了 checkbox 组件。
  就不会在打包 table-column 组件时，再把 checkbox 组件打包一次。
  而是在使用时从外部引入 checkbox 组件。

  但是没有解决样式冗余问题？
  自己的思考：这是为了更好的做样式覆盖吧。
*/
/*
  externals = {
    'element-ui/packages/pagination': 'element-ui/lib/pagination',
    ...
  }
*/
Object.keys(Components).forEach(function(key) {
  externals[`element-ui/packages/${key}`] = `element-ui/lib/${key}`;
});

externals['element-ui/src/locale'] = 'element-ui/lib/locale';
utilsList.forEach(function(file) {
  // 过滤掉 .js 扩展名
  file = path.basename(file, '.js');
  externals[`element-ui/src/utils/${file}`] = `element-ui/lib/utils/${file}`;
});
/*
  经过上面代码执行后，externals =
  {
    'element-ui/packages/pagination': 'element-ui/lib/pagination',
    ...
    'element-ui/src/locale': 'element-ui/lib/locale',
    'element-ui/src/utils/menu': 'element-ui/lib/utils/menu',
    'element-ui/src/utils/after-leave': 'element-ui/lib/utils/after-leave',
    ...
  }
*/
mixinsList.forEach(function(file) {
  file = path.basename(file, '.js');
  externals[`element-ui/src/mixins/${file}`] = `element-ui/lib/mixins/${file}`;
});
transitionList.forEach(function(file) {
  file = path.basename(file, '.js');
  externals[`element-ui/src/transitions/${file}`] = `element-ui/lib/transitions/${file}`;
});

externals = [Object.assign({
  vue: 'vue'
}, externals), nodeExternals()];

/*
  externals =
  {
    'vue': 'vue',
    'element-ui/packages/pagination': 'element-ui/lib/pagination',
    ...
    'element-ui/src/locale': 'element-ui/lib/locale',
    'element-ui/src/utils/menu': 'element-ui/lib/utils/menu',
    'element-ui/src/utils/after-leave': 'element-ui/lib/utils/after-leave',
    ...
    'element-ui/src/mixins/emitter': 'element-ui/lib/mixins/emitter',
    'element-ui/src/mixins/focus': 'element-ui/lib/mixins/focus',
    ...
    'element-ui/src/transition/collapse-transition': 'element-ui/lib/transition/collapse-transition',
  }
*/
exports.externals = externals;

// 注意，这里设置根目录的别名为 element-ui
exports.alias = {
  main: path.resolve(__dirname, '../src'),
  packages: path.resolve(__dirname, '../packages'),
  examples: path.resolve(__dirname, '../examples'),
  'element-ui': path.resolve(__dirname, '../')
};

/*
  在 webpack.conf.js 文件中会使用到，因为会全量打包为 umd。
  而组件库实际上是 Vue 的插件，也就是说 Vue 应该是组件库的外部依赖。
  因为组件库的使用者肯定会自行导入 Vue，所以在打包时不应该将 Vue 打包进组件库。
  如果只是简单的写
  externals: {
    vue: 'vue'
  }
  那打包后的组件库以 <script> 标签形式直接引入时，就会发现不能正常执行，提示 vue 未定义。
*/
exports.vue = {
  root: 'Vue',
  commonjs: 'vue',
  commonjs2: 'vue',
  amd: 'vue'
};

exports.jsexclude = /node_modules|utils\/popper\.js|utils\/date\.js/;
