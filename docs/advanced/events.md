# 事件监听

本文档描述 Ralltiir 在运行过程中抛出的事件，作为日志、性能统计等用途。
Ralltiir 抛出的事件包括两种：

* 一种是 ralltiir 单例上的事件，用来观察 Ralltiir 的行为。
* 一种是 `.rt-view` DOM 元素上的事件，用来观察视图的行为。

## Ralltiir 事件

Ralltiir 单例上的事件用来监听页面级别的行为。例如：

```javascript
var rt = require('ralltiir');
rt.on('dispatching', function (curr, prev){
    console.log('page change:', curr.url, prev.url);
});
```

### `dispatching`

页面切换事件。参数：

* `event.current`：当前页面参数。
* `event.previous`：当前页面参数。
* `event.extra`：发起页面跳转时的附加数据。

### `redirecting`

正在进行一次页面打开。参数：

* `event.url`：被打开的 URL。

## DOM 事件

Ralltiir Application 中的视图元素（即 `.rt-view`）会派发 Ralltiir 视图相关的事件，
比如加载、更新等。视图事件是 Ralltiir 派发给 `.rt-view` DOM 元素的事件，可以通过 DOM API 监听。
这些事件都以 `rt.` 为前缀。例如：

```javascript
var view = ('.rt-view');
view.addEventListener('rt.updated', function (event) {
    console.log('view updated', event);
});
```

### `rt-attached`

在 Attach [生命周期][life-cycle] 之后触发，此时视图已经加载到 DOM 树中。

### `rt-willDttach`

在 BeforeDetach [生命周期][life-cycle] 之后触发，此时视图仍然在 DOM 树中，但马上将会被移除。

### `rt-detached`

在 Detach [生命周期][life-cycle] 之后触发，此时视图已经不在 DOM 树中。

### `rt-willUpdate`

[局部更新][partial-update] 前（请求未发送） 触发。

参数：

* `event.url`：局部更新传入的 `url` 参数
* `event.options`：局部更新传入的 `options` 参数

## `rt-updated`

[局部更新][partial-update] 结束（DOM 已更新） 后触发

参数：

* `event.url`：局部更新传入的 `url` 参数
* `event.options`：局部更新传入的 `options` 参数

[life-cycle]: /advanced/life-cycle.md
[partial-update]: /advanced/partial-update.md
