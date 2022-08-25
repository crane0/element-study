问题整理

# 1，changelog.vue

## 1，疑问
1，样式为什么要这样写，不直接写到 .fr 下。
``` css
&.el-button {
  transform: translateY(-3px);
}
```

2，circle 属性是干啥的？chrome 浏览器直接提示 Unknown property name
``` css
li::before {
  content: '';
  circle: 4px #fff;
}
```

## 2，知识

1，页面上 li 前小点的样式
``` css
{
  display: inline-block;
  border: solid 1px #333;
}
```

# 2，nav.vue

dialog 展示图片，简易的实现方式，值得学习。

# 3，主题相关

之后再看，这里先不做研究