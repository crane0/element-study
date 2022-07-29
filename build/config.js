/*
  这是 webpack 的公共配置，比如 externals 和 alias
  externals 目的是为了让 webpack 打包时忽略配置的模块，加快打包速度，一般用于自己写的库的打包。
  参考 https://zhuanlan.zhihu.com/p/115305393
*/
var path = require('path');
var fs = require('fs');
var nodeExternals = require('webpack-node-externals');
var Components = require('../components.json');

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
Object.keys(Components).forEach(function(key) {
  externals[`element-ui/packages/${key}`] = `element-ui/lib/${key}`;
});

externals['element-ui/src/locale'] = 'element-ui/lib/locale';
utilsList.forEach(function(file) {
  file = path.basename(file, '.js');
  externals[`element-ui/src/utils/${file}`] = `element-ui/lib/utils/${file}`;
});
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

exports.externals = externals;

exports.alias = {
  main: path.resolve(__dirname, '../src'),
  packages: path.resolve(__dirname, '../packages'),
  examples: path.resolve(__dirname, '../examples'),
  'element-ui': path.resolve(__dirname, '../')
};

exports.vue = {
  root: 'Vue',
  commonjs: 'vue',
  commonjs2: 'vue',
  amd: 'vue'
};

exports.jsexclude = /node_modules|utils\/popper\.js|utils\/date\.js/;
