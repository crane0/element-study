问题整理

# 1，demo-block.vue

注释都写在页面中的。

# 2，footer-nav

6年前（2016年），布局使用float，还不是 flex，估计当时的兼容性不好。

获取 lang 的方式有什么区别吗？

footer-nav 和 search 通过 this.$route.meta.lang 获取

其他的几个 this.$route.path.split('/')[1]


# 3，footer

做了媒体查询，适应不同页面宽度。

使用了 [el-popover组件](https://element.eleme.cn/#/zh-CN/component/popover)，其中有自定义 v-popover 指令。之后可以研究下。

# 4，header

1，#v3-banner 的 z-index 为什么是 19

思考：全局的 z-index 应该做下管理记录。

2，router-link 中 slot 的使用问题，exact 问题 https://v3.router.vuejs.org/zh/api/#exact

3，el-dropdown 组件的使用；

- icon 的使用，直接添加 class 就可以了吗？

- el-dropdown-menu 有 input 方法吗

- el-dropdown-menu 的 slot 插槽处理。

4，mounted 中的测试，和 entry.js 中定义的 globalEle，应该是做个测试，作用未知。

5，通过发送请求的方式拿到 versions，为什么不直接导入呢？

# 5，search

使用的组件是 input 带输入建议

例子参考 https://element.eleme.cn/#/zh-CN/component/input#dai-shu-ru-jian-yi

属性介绍 https://element.eleme.cn/#/zh-CN/component/input#autocomplete-attributes

搜索功能通过 https://www.npmjs.com/package/algoliasearch 实现。

# 6，side-nav

组件和指南页面用到，对应的模板文件 
examples/pages/template/component.tpl
examples/pages/template/guide.tpl

传递的 props 是 nav 的数组翻译文件。

NodeList.forEach() 问题，已解决。