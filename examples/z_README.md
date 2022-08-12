梳理官网项目整体结构

``` javascript
- assets 图片，子图，公共样式
- components 组件
  - theme 未知x
  - theme-configurator 未知x
  - demo-block.vue，footer-nav.vue，footer.vue，header.vue，side-nav.vue 会在 entry.js 中全局注册使用。
  - search.vue 在 header.vue 使用，搜索文档。
  - theme-picker.vue 在 header.vue 使用，未知x
- demo-styles 页面展示组件效果的样式文件
- docs （多语言）组件页面md文件，最终会转化为 vue 渲染到页面上
- dom/class.js 增删，判断class存在的js方法
- extension 插件独立项目，这里忽略。

- i18n 多语言翻译配置文件
  - components.json 
    - 组件页面 demo-block 最下面的内容
    - 非组件页面的 footer
    - 顶部导航栏
  - page.json
    - 首页
    - 主题页面
    - 指南页面（包含2个页面）
    - 资源页面
  - route.json 标注有几个语言版本。
  - theme-editor.json 未知x
  - title.json 对应顶部导航栏设置的 document.title

- pages 页面vue文件，目录下默认只有模板文件，使用 build/bin/i18n.js 通过模板文件来生成vue文件。
  - changlog.vue 更新日志页面，在组件页面可以看到。
  - component.vue 组件页面。整体用 <el-scrollbar> 包裹，但这个组件官网却没有文档！（之后得研究是否只在内部使用）
    - 组件侧边栏 <side-nav>
    - 展示组件效果的 page-component__content
    - <el-backtop> 回到顶部组件
  - design.vue 指南/设计原则页面
  - guide.vue 指南总页面
  - index.vue 官网首页
  - nav.vue 指南/导航页面
  - resource.vue 资源页面
  - theme-nav.vue 未知x
  - theme-preview.vue [主题查看页面](https://element.eleme.cn/#/zh-CN/theme/preview)，可从主题/官方主题/查看 进入。
  - theme.vue 主题页面

- play/index.vue 用来测试和展示组件使用效果的。
- bus.js 未知x
- color.js 16进制转RGB, #FFB6C1 --> 255,182,193
- icon.json 通过 build/bin/iconInit.js 生成，在 entry.js 中引入并挂载到Vue的原型链上。最终在icon组件页面用于展示图标。
- index.tpl 模板文件，用于webpack打包生成index.html。需要注意的是，可以直接使用 process.env 变量。而不用在 HtmlWebpackPlugin 中定义属性，再到模板中使用 htmlWebpackPlugin.options.xxx 调用。
- nav.config.json 组件页面侧边导航栏翻译配置文件。
- play.js 也是项目的入口文件，但只对 play/index.vue 生效。在 build/webpack.demo.js 打包官网项目时，有做判断。
- route.config.js 路由
- util.js 工具类，得补充下用法
- versions.json 通过 build/bin/version.js 生成的官方文档的版本列表，被 build/webpack.demo.js 打包到项目根目录。在 examples/components/header.vue 中使用。
```