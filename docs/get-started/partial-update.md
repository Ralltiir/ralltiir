# 局部更新

局部更新用于改变当前 URL 并只更新页面中的一部分，并产生浏览历史记录。
常见需求包括下拉刷新和切换 Tab。

```javascript
var rt = document.querySelector('.rt-view.active').ralltiir
rt.partialUpdate(<url>, <options>);
```

## API

* `url` 表示目标页面的地址。Ralltiir 会去获取该页面内容，当前URL也会改为该 URL，必选。
* `options.to`（`'.news-list .content'`）表示被渲染到的目标 DOM 的选择符，可选，默认为 `.rt-body`。
* `options.from`（`'.news-list .content'`）表示提取目标页面的哪一步分，可选，默认为整个目标页面内容。
* `options.replace`（`true`）表示是否替换掉目标 DOM 中的内容，默认为 `false`。

下面介绍一个无限下拉的例子：

## HTML 内容

假设有一个新闻页面需要实现无限下拉的新闻列表，`/news?page=1` 返回第一页的 HTML：

```html
<html>
<body class="container">
  ...
  <ul class="news-list">
      <li>第一条新闻</li>
      <li>第二条新闻</li>
  </ul>
  ...
</body>
</html>
```

`/foo?page=2` 返回的 HTML 页面可能是这样的：

```html
<html>
<body class="container">
  ...
  <ul class="news-list">
      <li>第三条新闻</li>
      <li>第四条新闻</li>
  </ul>
  ...
</body>
</html>
```

## 调用方式

此时需要将第三、第四条新闻更新到当前页面中，可以调用局部更新：

```javascript
rt.partialUpdate('/news?page=2', {
    to: '.news-list',
    replace: false,
    from: '.news-list'
});
```

此时 Ralltiir 会立即向 `/foo?page=2` 获取 HTML，读取其中的 `.news-list` 并更新对应内容。
该 API 返回一个Promise，成功解析后页面 URL 为 `/news?page=2`，DOM 结构如下：

```html
<html>
<body class="container">
  ...
  <ul class="news-list">
      <li>第一条新闻</li>
      <li>第二条新闻</li>
      <li>第三条新闻</li>
      <li>第四条新闻</li>
  </ul>
  ...
</body>
</html>
```

> `options.replace` 参数为 `true` 可以移除既有内容，用来实现 Tab 切换。

## 异步请求

Ralltiir 发送的异步请求在 HTTP 头部设置了局部更新的相关参数。
服务器可以据此做性能优化和统计。以上述 `/news?page=2` 为例：

```
# Url
/news?page=2

# Headers:
x-rt: true
x-rt-partial: true
x-rt-selector: options.from || ':root'
```
