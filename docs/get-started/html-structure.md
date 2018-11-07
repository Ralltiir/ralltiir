# 页面结构

只有符合 Ralltiir 页面结构的页面，才能被 Ralltiir 识别并正常打开。

本文介绍合法的 Ralltiir 页面应用的 DOM 结构，以及各部分的语义。
具体的 Ralltiir 渲染过程比如顺序、并发等细节请参考 [页面渲染][render]。

## 概述

我们知道浏览器接受的 HTML 内容分为 `<head>` 和 `<body>` 两部分，
Ralltiir Application 接受的 `.rt-view` 应包含（并且只包含） `.rt-head` 和 `.rt-body` 两部分，
它们构成了合法的 Ralltiir 页面。其中：

* `.rt-head` 负责顶部导航栏的渲染；
* `.rt-body` 负责当前页面内容的渲染。

`.rt-view` 可以位于 `<body>` 中的任何地方，`.rt-view` 之外的部分不会被 Ralltiir 识别和渲染，
但如果直接用浏览器打开时，浏览器会执行它们。
因此 `.rt-view` 之外适合放置只在同步页面执行的脚本（通常是框架性质的）。
比如引入 Ralltiir，以及注册路由。

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

## 主体内容

* 同步渲染（服务器端）：当用户直接打开该页面时，Ralltiir 会解析 `.rt-view` 中的 `.rt-head` 和 `.rt-body` 部分，不会干涉浏览器对它们的渲染。
* 异步渲染：当用户在 App 中打开一个异步载入的页面时，Ralltiir 会下载对应 HTML 并提取其中的 `.rt-head` 和 `.rt-body` 并用来渲染。

在这两种渲染场景下 **`.rt-view` 内的内容** 与 **`.rt-view` 外的内容** 是否执行见下表。
其中 **执行** 是指 DOM 节点会应用到 DOM 树中，样式会被下载和应用，脚本会得到执行。

场景     | `.rt-view` 内 | `.rt-view` 外
---      | ---           | ---
同步渲染 | 执行          | 执行
异步渲染 | 执行          | 不执行

[render]: advanced/load-and-render.md
