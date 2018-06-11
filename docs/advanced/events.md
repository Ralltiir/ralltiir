# 事件监听

本文档描述 Ralltiir 在运行过程中抛出的事件，作为日志、性能统计等用途。
Ralltiir 抛出的事件包括两种：

* 一种是 ralltiir 单例上的事件，用来观察 Ralltiir 的行为，下文称 **Ralltiir 事件**。
* 一种是 `.rt-view` DOM 元素上的事件，用来观察视图的行为，下文称 **DOM 事件**。

## Ralltiir 事件

Ralltiir 单例上的事件用来监听页面级别的行为。例如：

```javascript
var rt = require('ralltiir');
rt.action.on('dispatching', function (curr, prev){
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

### `redirectFailed`

Redirect 操作抛出了异常。参数：

* `event.url`：被打开的 URL。
* `event.message`：异常消息。
* `event.stack`：异常调用栈。

> 对，这就是一个 `Error` 对象。

## DOM 事件

Ralltiir Application 中的视图元素（即 `.rt-view`）会派发 Ralltiir 视图相关的事件，
比如加载、更新等。视图事件是 Ralltiir 派发给 `.rt-view` DOM 元素的事件，可以通过 DOM API 监听。
这些事件都以 `rt.` 为前缀。例如：

```javascript
var view = document.querySelector('.rt-view.active');
view.addEventListener('rt.updated', function (event) {
    console.log('view updated', event);
});
```

### `rt.willAttach`

含义：在 Attach [生命周期][life-cycle] 之前触发，此时视图 DOM 还未加载到 DOM 树中。

冒泡：否

### `rt-attached`

含义：在 Attach [生命周期][life-cycle] 之后触发，此时视图 DOM 已经加载到 DOM 树中。

冒泡：否

### `rt.willDetach`

含义：在 BeforeDetach [生命周期][life-cycle] 之后触发，此时视图 DOM 仍然在 DOM 树中，但马上将会被移除。

冒泡：否

### `rt.detached`

含义：在 Detach [生命周期][life-cycle] 之后触发，此时视图 DOM 已经不在 DOM 树中。

冒泡：否

### `rt.willUpdate`

含义：[局部更新][partial-update] 前（请求未发送） 触发。

冒泡：是

参数：

* `event.url`：局部更新传入的 `url` 参数
* `event.options`：局部更新传入的 `options` 参数

## `rt.updated`

含义：[局部更新][partial-update] 结束（DOM 已更新） 后触发

冒泡：是

参数：

* `event.url`：局部更新传入的 `url` 参数
* `event.options`：局部更新传入的 `options` 参数

## `rt.message`

含义：有页面间通信事件到来，可能来自同一个 View Name，也可能来自其他 View Name。
发送事件的 API 请参考 [页面通信][messaging]。

冒泡：否

参数：

* `event.data`：事件内容。与发送时传入的 `message` 完全相等（`===`）。

[life-cycle]: /advanced/life-cycle.md
[partial-update]: /get-started/partial-update.md
[messaging]: /advanced/messaging.md
