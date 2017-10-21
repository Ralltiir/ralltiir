# 页面加载和渲染

本文档描述 [Ralltiir Application][rt-app] 是如何加载和渲染一个页面的。
在 Ralltiir 中打开一个异步页面的整个执行流程如下：

1. 用户发起页面切换。用户点击一个有 `[data-sf-href]` 属性的 `<a>` 标签，或使用 JavaScript API 调用了页面切换。
2. Ralltiir 路由分发。找到对应的 Service，没有则创建（`constructor`）一个。
3. Service 发起跨域网络请求。目标页面 Service 的 `beforeAttach` 中发起网络请求。
4. Service 开始入场动画。同时把目标页面的 DOM 框架创建好，并使用默认配置初始化视图。
5. 开始渲染页面。网络请求完成后提取其中的 `.rt-view` 进行渲染。
6. 等待外部样式表下载完成。
7. 解析目标页面中的 DOM 节点并移动到当前 DOM 树。
8. 等待脚本（外链和内联）执行完成。
9. 渲染结束。

下面主要介绍 3-8 的渲染过程，相关代码在 [render.js][render.js]

## 异步请求

Ralltiir 会发送异步请求获取被打开的页面，这个页面需要是 [合法的 Ralltiir 页面][html-structure]。
该异步请求可以是跨域的，但需要服务器做相应的配置。
注意默认 Ralltiir 会发送 Cookie，所以需要配置 `Access-Control-Allow-Credentials`。

请求中会带 `x-rt: true` 来表明这是来自 Ralltiir 的异步请求，服务器可以借此做性能优化和统计，例如：

```
# Url
/news?page=1

# Headers:
x-rt: true
```

## 提取异步内容

异步请求返回的 HTML 中，并不是所有内容都会被渲染。Ralltiir 只会渲染其中 `.rt-view` 中的部分。
其中，

* `.rt-view .rt-head` 会被渲染到头部导航栏。
* `.rt-view .rt-body` 会被渲染到主体内容区。

其中的样式和脚本都会执行。但除此之外的 DOM 部分则不会被渲染。

## 渲染过程

为了模拟浏览器同步渲染行为，保证页面样式不发生跳动，脚本也能得到执行。异步渲染过程分为 3 步：

1. 下载所有外部样式表并应用。Ralltiir 会监听样式表的状态，等待它们全部完成。因此异步页面中任何位置出现的外部样式表都会阻塞 Ralltiir 的异步渲染。
2. 移动所有 DOM 节点到对应位置。`.rt-head` 移动到 DOM 树的 `.rt-head` 处，`.rt-body` 移动到 DOM 树的 `.rt-body` 处。
3. 执行所有内联我外链 JavaScript。注意为了性能考虑这些脚本的执行是并发的，无序的。因此接入 Ralltiir 的页面强烈建议 AMD 化。

`.rt-body` 和 `.rt-head` 会分别地、并发地进行上述步骤。

[rt-app]: https://github.com/Ralltiir/ralltiir-application
[render.js]: https://github.com/Ralltiir/ralltiir-application/blob/master/view/render.js
[html-structure]: /get-started/html-structure.md
