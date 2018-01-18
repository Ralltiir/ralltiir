# 页面加载和渲染

在引入 Ralltiir 框架后，页面渲染分为两种方式：

1. 同步渲染。用户直接从浏览器访问页面，或者刷新页面，这时浏览器负责加载和渲染页面（不走 Ralltiir 渲染模块，本文档中称为同步渲染）。
2. 异步渲染。用户点击 [链接](get-started/rt-link.md)，浏览器前进后退，或者调用 [页面切换 API](/api/action.md) 时，由 Ralltiir 异步加载和渲染页面。

本文档描述 [Ralltiir Application][rt-app] 异步渲染的流程：

1. 用户发起页面切换。
2. Ralltiir 路由分发。找到或创建对应的页面实例，调用页面的 `beforeAttach` 并发起网络请求。
3. 同时开始入场动画。同时把目标页面的 DOM 框架创建好，并使用默认配置初始化视图。
4. 动画结束后渲染页面。网络请求完成后提取其中的 `.rt-view` 并开始渲染。
5. 渲染第一步：等待外部样式表下载完成。
6. 解析目标页面中的 DOM 节点并移动到当前 DOM 树（同时移除 loading 动画）。
7. 等待脚本（外链和内联）执行完成。

下面主要介绍 3-7 的渲染过程，相关代码在 [render.js][render.js]

## 异步请求

Ralltiir 会发送异步请求获取被打开的页面，这个页面需要是 [合法的 Ralltiir 页面][html-structure]。
该异步请求可以是跨域的，但需要服务器做相应的配置。
注意默认 Ralltiir 会发送 Cookie，所以需要配置 `Access-Control-Allow-Credentials`。

请求 URL 会带 `rt=true` 参数来表明这是来自 Ralltiir 的异步请求，服务器可以借此做性能优化和统计，例如：

```
# Url
/news?rt=true
```

## 提取异步内容

异步请求返回的 HTML 中，并不是所有内容都会被渲染。Ralltiir 只会渲染其中 `.rt-view` 中的部分。
其中，

* `.rt-view .rt-head` 会被渲染到头部导航栏。头部内容可以在 [注册路由时配置](/get-started/router.md)，渲染策略更为复杂，请参考 [预渲染和替换策略](/advanced/head-rendering.md)。
* `.rt-view .rt-body` 会被渲染到主体内容区。
* HTML 中的其余内容不会被提取，因此不会被异步渲染。

## 渲染过程

`.rt-head` 和 `.rt-body` 会先后执行 *渲染算法*，即 `.rt-head` 的渲染会阻塞 `.rt-body`。
*渲染算法* 尽量与浏览器同步渲染行为保持一致，该算法分为 3 步：

1. 下载所有外部样式表并应用。Ralltiir 会监听样式表的状态，等待它们全部完成。因此异步页面中任何位置出现的外部样式表都会阻塞 Ralltiir 的异步渲染。
2. 移动所有 DOM 节点到对应位置。`.rt-head` 移动到 DOM 树的 `.rt-head` 处，`.rt-body` 移动到 DOM 树的 `.rt-body` 处。
3. 执行所有内联我外链 JavaScript。注意为了性能考虑这些脚本的执行是并发的，无序的。因此接入 Ralltiir 的页面强烈建议 AMD 化。

## 渲染错误

网络错误或者渲染错误都会触发 Ralltiir 的容错机制，从而跳转同步页面。
此时页面 URL 上会添加 `rt-err` 参数来标识错误原因，它们的值见下表：

错误原因 | `rt-err`
页面请求 4xx 或 5xx | XHR 的 HTTP 状态码
页面请求 CORS 失败 | 901
返回的[页面结构][html-structure]不合法 | 901
返回页面的内联 `<script>` 抛出异常 | 901

[rt-app]: https://github.com/Ralltiir/ralltiir-application
[render.js]: https://github.com/Ralltiir/ralltiir-application/blob/master/view/render.js
[html-structure]: /get-started/html-structure.md
