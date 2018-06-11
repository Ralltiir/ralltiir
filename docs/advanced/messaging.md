# 页面通信

Ralltiir 提供了页面间通信机制，这一机制的实现原理是广播。
广播目标的名字（View Name）在 [options.name][options] 中指定，也可以指定广播给所有页面（`*`）。

## 注册是给定 name

```javascript
rt.services.register('/zhaopin/position/:id', {
    name: 'baidu-zhaopin',
    title: '百度招聘'
});
```

这里的 [name][options] 在发送广播事件时，有两种用途：

* 通过指定为 `target`（见下文）来发给注册为 `"baidu-zhaopin"` 的这些页面。
* 省略 `target` 参数，默认发给与当前页面同样 `name` 的页面。

## 发送广播事件

通过 `<rt-view>.ralltiir.postMessage(msg, [target])` 接口可以发送广播事件。
参数如下：

* `msg`：任何类型，最终会通过 `event.data` 传递给 [rt.message 事件][events]。
* `target`：`String` 类型（可选）
    * 如果不传，默认发送事件给与当前页面同样 [name][options] 的页面；
    * 如果值为 `"*"`，发送事件给所有页面；
    * 其他任何情况，会发送事件给 `name===target` 的页面。

```javascript
var view = document.querySelector('.rt-view.active');
// 发送给与当前页面同样 name 的一组页面；对于上面的例子，等价于：
// view.ralltiir.postMessage('something happened here!', 'baidu-zhaopin');
view.ralltiir.postMessage('something happened here!');
// 广播给所有 Ralltiir 页面
view.ralltiir.postMessage('something happened here!', '*');
```

这里是一个 Demo：
https://github.com/Ralltiir/ralltiir-application-demo/blob/master/postmessage-2.html

## 监听广播事件

页面通信事件通过 DOM 广播，在 `.rt-view` 上监听 [rt.message 事件][events] 即可。

```javascript
var view = document.querySelector('.rt-view.active');
view.addEventListener('rt.message', function (event) {
    console.log('message received:', event.data);
});
```

这里是一个 Demo：
https://github.com/Ralltiir/ralltiir-application-demo/blob/master/postmessage-1.html

[options]: /get-started/view-options.html
[events]: /advanced/events.md
