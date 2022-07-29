/*
  作用：
  默认情况下，examples/pages 目录下，只有 template 目录。
  通过运行 build/bin/i18n.js 文件会根据 template 目录的模板，生成4种语言的文档。
  所以，这里监听 template 目录，当模板发生变化时，重新运行上面的 i18n.js 文件生成新文档。
*/
const path = require('path');
// 要被监听的目录
const templates = path.resolve(process.cwd(), './examples/pages/template');
// 监听工具
const chokidar = require('chokidar');
// 开启监听 template 目录
let watcher = chokidar.watch([templates]);

// 当目录下的文档发生变化时，执行 npm run i18n
watcher.on('ready', function() {
  watcher
    .on('change', function() {
      exec('npm run i18n');
    });
});

function exec(cmd) {
  return require('child_process').execSync(cmd).toString().trim();
}
