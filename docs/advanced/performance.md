# 性能数据

同步页面（浏览器渲染）建议从 [PerformanceTiming][PerformanceTiming] 获取性能数据，
对于 Ralltiir 异步渲染的页面可以使用 Ralltiir 提供的 Performance API。

> Ralltiir Performance API 与 PerformanceTiming API 稍有不同，这是异步渲染的性质和 Ralltiir 的工作方式决定的。

## 使用方式

```javascript
var rt = document.querySelector('.rt-view#your-page-id').ralltiir;
console.log(rt.performance.navigationStart);
```

这里是在线 Demo：<https://ralltiir.github.io/ralltiir-application-demo/home>，
点击其中的 Performance API 即可预览。`rt.performance` 的属性详情如下：

## navigationStart

类型: `Number`

导航开始的 Unix 时间戳，单位为毫秒。

## requestStart

类型: `Number`

XHR 请求开始的 Unix 时间戳，单位为毫秒。此时正在发送异步页面请求。

## domLoading

类型: `Number`

DOM 开始渲染的 Unix 时间戳，单位为毫秒。此时刚收到服务器返回的结果，正要开始渲染。

## headInteractive

类型: `Number`

`.rt-head` 部分渲染完成的 Unix 时间戳，单位为毫秒。此时用户已经可以与服务器返回的头部进行交互。

## domContentLoaded

类型: `Number`

整个 `.rt-view` 首屏渲染完成的 Unix 时间戳，此时样式与 HTML 都已经可用，但脚本仍然在执行。

## domInteractive

类型: `Number`

整个 `.rt-view` 渲染完成的 Unix 时间戳，单位为毫秒。此时样式、HTML、脚本已经加载完成，但每次资源仍在加载。注意：这个时间戳在 `rt.attached` 事件之后才可用，可参考：[Ralltiir 事件](/advanced/events.md)

[PerformanceTiming]: https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/timing
