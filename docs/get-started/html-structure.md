# 页面结构

Ralltiir Application 是一个运行在浏览器中的异步浏览器。
在启动 Ralltiir 之前需要先让你的页面结构符合 Ralltiir 的要求，
这样才能识别页面内容并实现异步打开。本文介绍合法的 Ralltiir 页面结构。

我们知道浏览器接受的 HTML 内容分为 `<head>` 和 `<body>` 两部分，
Ralltiir Application 接受的 `.rt-view` 也需分为 `.rt-head` 和 `.rt-body` 两部分，
它们构成了合法的 Ralltiir 页面。其中：

* `.rt-head` 负责顶部导航栏的渲染；
* `.rt-body` 负责当前页面内容的渲染。

`<body>` 的其余部分不会被 Ralltiir Application 读取，但浏览器会执行它们。
因此被用来包含首页独有的 HTML 和 JavaScript，比如注册 Ralltiir Application 的路由。

## 一个例子

页面中必须包含一个 `#sfr-app` 元素，定义一个 `.rt-view` 来包含（服务器端渲染的）当页内容。
其中 `.rt-head` 用来包含头部内容（导航栏），`.rt-body` 用来包含页面主体内容。

```html
<div id="sfr-app">
    <div class="rt-view">
        <div class="rt-head">
            <div class="rt-back"></div>
            <div class="rt-actions"></div>
            <div class="rt-center">
                <span class="rt-title"></span>
                <span class="rt-subtitle"></span>
            </div>
        </div>
        <div class="rt-body"></div>
    </div>
</div>
```

这里有个 Live Demo：<https://ralltiir.github.io/ralltiir-application-demo/home>

## 头部内容

Ralltiir Application 中，`.rt-head` 的每个部分都有清晰的含义，这些部分都是可选的。

* 在 `.rt-back` 中添加返回按钮的内容
* 在 `.rt-title` 中添加标题的内容
* 在 `.rt-subtitle` 中添加副标题的内容
* 在 `.rt-actions` 中添加小于2个的工具按钮

> 因为移动端页面的宽度有限，不建议编写太长的 `title`，也不建议包含 `subtitle`。

每一部分的内容都可以是合法的 HTML，Ralltiir Application 会直接渲染。其中引用的 iconfont、样式表都会直接引用全局作用域。
其中 `.rt-actions` 只能包含一个或两个子元素，例如：

```html
<div class="rt-actions">
    <i class="fa fa-twitter"></i>
    <i class="fa fa-share"></i>
</div>
```

## 主体内容

`.rt-body` 用来包含页面主体内容。Ralltiir Application 中页面加载有两种方式：

* 同步渲染（服务器端）：当用户直接打开该页面时，Ralltiir 会解析 `.rt-view` 中的 `.rt-head` 和 `.rt-body` 部分，不会干涉浏览器对它们的渲染。
* 异步渲染：当用户在 App 中打开一个异步载入的页面时，Ralltiir 会下载对应 HTML 并提取其中的 `.rt-head` 和 `.rt-body` 并用来渲染。

在这两种渲染场景下 **`.rt-view` 内的内容** 与 **`.rt-view` 外的内容** 是否执行见下表。
其中 **执行** 是指 DOM 节点会应用到 DOM 树中，样式会被下载和应用，脚本会得到执行。

场景     | `.rt-view` 内 | `.rt-view` 外
---      | ---           | ---
同步渲染 | 执行          | 执行
异步渲染 | 执行          | 不执行

> 具体的 Ralltiir 渲染方式请参考 [[页面渲染]]。
