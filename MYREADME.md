注意，想要成功运行 `npm run dev`，必须得成功安装 `node-sass`

如果安装`node-sass`失败，解决办法[参考](https://juejin.cn/post/6946530710324772878)。

**我的解决办法，是匹配版本**

注意到 `yarn.lock` 文件中 node-sass@^4.11.0，再根据上面的[node-sass依赖介绍](https://www.npmjs.com/package/node-sass)中，node应该使用 v11 版本。

所以我本地使用 nvm 安装了 `nvm install v11.15.0` 版本，在这个版本下，使用 `yarn` 命令安装项目依赖，也成功安装了 `node-sass`。

- 

正文

[参考](https://juejin.cn/post/6935977815342841892#heading-20)
# 1，example 是官网项目。

## 1.1，icon
examples/icon.json 文件被 examples/entry.js 引用，并挂载到vue的原型链上。
``` js
Vue.prototype.$icon = icon; // Icon 列表页用
```
在 `examples/docs/zh-CN/icon.md` 中使用

## 1.2，文档代码+demo 的效果

比如 button 组件，页面会展示出来显示效果，同时也可以查看代码。

逻辑：

在`examples/route.config.js`中使用`registerRoute`生成组件页面的路由配置时，使用 `loadDocs` 方法加载`/examples/docs/{lang}/comp.md`。 
但 `.md` 文件却能像 `.vue` 文件一样在页面上渲染成为 Vue 组件，这是通过webpack做到的。

> webpack 的理念是一切资源都可以 require，只需配置相应的 loader 即可

在 `build/webpack.demo.js` 中，先通过 `build/md-loader` 处理`.md` 文件，解析出 vue 代码交给 `vue-loader`，最终生成 vue 单文件组件，渲染到页面上。

## 1.3，持续集成相关

在代码 push 到远程仓库时，远程仓库的 ci 会自动找 .travis.yml 文件，这个文件会执行 build/deploy-ci.sh

# 其他

`build/gen-single-config.js` 没有被用到。

`build/git-release.sh`，本地 dev 分支和远程 dev 分支做了 diff 合并。

`build/release.sh` 发包时使用，
其中用到了 `npx select-version-cli`，可以根据上个版本号，来选择设置当前版本号。

element 使用 eslint 做代码规范，并且设置了自己的规范 `elemefe`。
为了保证官网的质量，在 `build/webpack.demo.js` 中配置了 eslint-loader，项目启动时强行检查代码质量。

其他模块，可以看 `npm run lint` 命令涉及到哪些。

# 组件库

组件库是由 packages 和 src 文件目录组成。
理由模块化开发的思想，把组件饿依赖和一些公共模块放到 src 目录下，并依据功能拆分出以下模块
- utils，定义一些工具方法
- transition，动画
- mixins，全局混入的一些方法
- local，国际化功能以及各种语言的 部分组件 的翻译文件
- directives，指令

/src/index.js 是通过脚本 /build/bin/build-entry.js 脚本自动生成，是组件库的入口。负责自动导入组件库的所有组件、定义全量注册组件库组件的 install 方法，然后导出版本信息、install 和 各个组件。