'use strict';
/*
  作用，
  生成在文档页面 https://element.eleme.cn/#/zh-CN/component/icon 使用的图标集合。
  最终生成的 examples/icon.json 会在 examples/entry.js 中引用。
*/
var postcss = require('postcss');
var fs = require('fs');
var path = require('path');
var fontFile = fs.readFileSync(path.resolve(__dirname, '../../packages/theme-chalk/src/icon.scss'), 'utf8');
var nodes = postcss.parse(fontFile).nodes;

var classList = [];
/*
  postcss 会解析 icon.scss 中每一个表达式。
  但有的表达式不是css选择器，所以就没有 node.selector 这个属性。
  在用正则取到了符合条件的css选择器。
*/
nodes.forEach((node) => {
  // icon.scss 中每一个类名。
  var selector = node.selector || '';
  // console.log('selector', selector);
  // 为了找到符合 .el-icon-ice-cream-round:before 这样的类名。
  var reg = new RegExp(/\.el-icon-([^:]+):before/);
  /*
    arr 举例
    [
      '.el-icon-ice-cream-round:before',
      'ice-cream-round',
      index: 0,
      input: '.el-icon-ice-cream-round:before',
      groups: undefined
    ]
  */
  var arr = selector.match(reg);
  if (arr && arr[1]) {
    classList.push(arr[1]);
  }
});
// console.log('classList', classList);

// classList 是所有符合下面格式的类名，取中间部分的集合
// .el-icon-ice-cream-round:before => ice-cream-round
classList.reverse(); // 希望按 css 文件顺序倒序排列

fs.writeFile(path.resolve(__dirname, '../../examples/icon.json'), JSON.stringify(classList), () => {});
