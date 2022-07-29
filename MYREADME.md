# 1，example 是官网项目。

## 1.1，icon
examples/icon.json 文件被 examples/entry.js 引用，并挂载到vue的原型链上。
``` js
Vue.prototype.$icon = icon; // Icon 列表页用
```
在 `examples/docs/zh-CN/icon.md` 中使用
