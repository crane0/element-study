'use strict';

/*
  目标文件：examples/pages/template，

  作用：通过上面的目标文件模板，生成官网不同语言的翻译文件，文档。会在 examples/pages 目录下生成。
*/
var fs = require('fs');
var path = require('path');
var langConfig = require('../../examples/i18n/page.json');

var once = false;

langConfig.forEach(lang => {
  try {
    // fs.statSync 获取路径信息
    fs.statSync(path.resolve(__dirname, `../../examples/pages/${ lang.lang }`));
  } catch (e) {
    // 如果没有获取到，则创建目录。
    fs.mkdirSync(path.resolve(__dirname, `../../examples/pages/${ lang.lang }`));
  }

  Object.keys(lang.pages).forEach(page => {
    var templatePath = path.resolve(__dirname, `../../examples/pages/template/${ page }.tpl`);
    var outputPath = path.resolve(__dirname, `../../examples/pages/${ lang.lang }/${ page }.vue`);
    var content = fs.readFileSync(templatePath, 'utf8');
    var pairs = lang.pages[page];

    Object.keys(pairs).forEach(key => {
      if (!once) {
        // console.log('pairs', pairs);
        // console.log('key', key);
        // console.log('content', content);
        once = true;
      }
      content = content.replace(new RegExp(`<%=\\s*${ key }\\s*>`, 'g'), pairs[key]);
    });

    fs.writeFileSync(outputPath, content);
  });
});
