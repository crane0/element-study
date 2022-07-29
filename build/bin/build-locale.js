/*
  目标文件：
  是 src/locale/lang 文件夹内的js文件（各个语言的翻译），它们都是 CommonJS 模块。
  js 文件中是否有 exports.__esModule = true;，编译后的UMD模块是有区别的（不影响UMD模块的使用）。
  主要是 babel 在引入时，处理会有所不同，主要为了处理 default 的问题。

  作用：
  使用 babel 将 CommonJS 模块都转译为 UMD 模块。
  UMD模块是通用兼容的。
*/

var fs = require('fs');
var save = require('file-save');
var resolve = require('path').resolve;
// 下面的用法，是根据路径，得到当前文件的名称，第2个参数传了后缀，所以结果不包括后缀。
var basename = require('path').basename;
// __dirname 是运行当前文件的绝对路径，下面是拼接2个路径，组成lang文件夹的绝对路径。
var localePath = resolve(__dirname, '../../src/locale/lang');
// 返回一个包含“指定目录下所有文件名称”的数组对象。
var fileList = fs.readdirSync(localePath);

// 使用 babel 将 cjs 模块编译为 UMD 模块
// transform-es2015-modules-umd 这个插件目前找不到了，被这个替换了 https://babeljs.io/docs/en/babel-plugin-transform-modules-umd
var transform = function(filename, name, cb) {
  require('babel-core').transformFile(resolve(localePath, filename), {
    plugins: [
      'add-module-exports',
      ['transform-es2015-modules-umd', {loose: true}]
    ],
    moduleId: name
  }, cb);
};

fileList
  .filter(function(file) {
    return /\.js$/.test(file);
  })
  .forEach(function(file) {
    var name = basename(file, '.js');

    transform(file, name, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        var code = result.code;

        // 这里替换了AMD和浏览器环境的内容，还不确定在哪里用到。
        code = code
          .replace('define(\'', 'define(\'element/locale/')
          .replace('global.', 'global.ELEMENT.lang = global.ELEMENT.lang || {}; \n    global.ELEMENT.lang.');
        save(resolve(__dirname, '../../lib/umd/locale', file)).write(code);

        console.log(file);
      }
    });
  });
