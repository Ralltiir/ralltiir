# 启动 Ralltiir 

本文介绍如何使用 Ralltiir Application，启动一个简单的 Ralltiir 应用。
在此之前你需要让你的 HTML 符合 [Ralltiir 页面结构][html]。

## 注册 Service

现在编写两个页面，其 URL 分别为 `/home` 和 `/profile`。
然后在入口页面注册这两个 URL：

```javascript
var rt = require('ralltiir');
var Service = require('ralltiir-application/service');

rt.services.register('/home', {title: {html: '主页标题'}}, Service);
rt.services.register('/profile', {title: {html: '个人页标题'}}, Service);

// 启动 Ralltiir
rt.action.start();
```

详细的 `.register()` 参数请参考 [路由与跳转](/get-started/router.md)。

## 点击打开

在 `/home` 页面添加到 `/profile` 的链接：

```javascript
<a href="profile" data-sf-href="/profile">前往个人页</a>
```

点击该链接即可从 `/home` 页异步打开 `/profile` 页面。

[html]: /get-started/html-structure.md
