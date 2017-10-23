# Ralltiir 链接

Ralltiir 可以劫持超链接的点击并进行异步跳转。
为了不干扰正常的超链接，Ralltiir 跳转的超链接需要添加额外的属性 `data-sf-href`，
另有 `data-sf-options` 可以配置过渡态配置参数。

## data-sf-href

只要添加了 `data-sf-href` 的 `<a>` 标签，Ralltiir 都会接管跳转。例如：

```html
<li><a href="/todos/527" data-sf-href="/todos/527">Todo 527</a></li>
<li><a href="/lists/238" data-sf-href="/lists/238">List 238</a></li>
```

跳转链接的路径需要匹配 [注册时的 URL Pattern][router]。

> 建议在添加 `data-sf-href` 的同时添加 `href` 属性。一来更健壮和可互操作，二来可以避免 Safari 上无 href 不触发 click 事件的 Bug。

## data-sf-options

JSON 序列化后的 [视图参数][view-options]，用来配置目标页面的过渡态。例如：

```html
<li>
  <a href="/todos/527"
     data-sf-href="/todos/527"
     data-sf-options="{title:{html:'详情页'}}"> Todo 527 </a>
</li>
```

如果编写在 HTML 代码中需注意 HTML 转义。

[view-options]: /get-started/view-options.md
[router]: /get-started/router.md
