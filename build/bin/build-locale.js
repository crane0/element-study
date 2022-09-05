/*
  目标文件：
  src/locale/lang 目录下的 js，它们有的是 esm 模块（af-ZA.js），有的是 cjs 模块（az.js）。
  cjs 模块的 js 中，添加了 exports.__esModule = true;
    目的是让 babel 放心加载该模块，并调用 exports.default 这个导出的对象。
    也就是 ES6 规定的默认导出对象，所以这个模块既符合 CommonJS 标准，又符合 Babel 对 ES6 模块化的需求。

  作用：
  使用 babel，用 transform-es2015-modules-umd 来转译 esm 模块为 UMD 模块，
  但有的模块是 cjs 模块，为了符合 es6 模块化的需求，才有了上面的 exports.__esModule = true; 解释。
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
