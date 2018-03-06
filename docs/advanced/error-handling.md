# 错误处理

Ralltiir 内置了错误处理过程，在页面载入和局部更新失败时触发。
错误处理过程很简单：让浏览器直接访问同步页面。

## 错误收集

在访问同步页面的同时，Ralltiir 会添加额外的 [URL 参数][url-param]，以表征错误的原因。
对于发生错误而跳转同步的页面，服务器可以收集到两个 URL 参数：

* `rt-err`：0 到 1000 的数字，表示错误状态码。
* `rt-msg`：字符串，表示错误消息。

> 所有由 Ralltiir 内置过程添加的 URL 参数都以 `rt-` 为前缀。

## 状态码

状态码 | 语义
---    | ---
4xx    | 服务器对异步网络请求返回了 4xx 状态码
900    | 未知网络错误，通常是由于跨域、重定向等原因，ajax 收不到状态码
910    | rt-head 渲染错误，通常是 rt-head 不存在或不合法
911    | rt-body 渲染错误，通常是 rt-body 不存在或不合法
919    | 未知渲染错误
999    | 未知错误

[url-param]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
