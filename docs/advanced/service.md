# Service

Service 是处理页面下载和渲染等逻辑的载体。可以将一个 Service 注册到一个 URL 模式。
在 Ralltiir 打开这个 URL 时，就会调用对应 Service 的生命周期函数来完成下载和渲染。

在 Ralltiir 中 Service 有两种类型：

* 一种是单例 Service，对应一个 URL Pattern。
* 一种是实例 Service，一个 Service 类对应一个 URL Pattern，一个 Service 实例对应一个异步页面实例。

这两种 Service 的区别在于后者在接管页面前，Ralltiir 会把它创建为实例，负责要打开的异步页面。

## 单例 Service 

单例 Service 有 4 个生命周期函数，它们分别负责页面的入场和退场。
设计4个而不是2个是因为 Web 应用的特殊性：前后两个页面共享一个 DOM。
声明周期函数的调用时机请参考 [生命周期](/advanced/life-cycle.md)

单例 Service 有 4 个生命周期函数：`create`, `attach`, `detach`, `destroy`。
它们分别在入场、渲染、退场前、退场后被调用。一个简单的单例 Service 如下：

```javascript
var service = {
    create: function() {},
    attach: function() {},
    detach: function() {},
    destroy: function() {}
}
rt.action.regist('/foo', service)
```

> 注意打开不同页面时都会调用同一个 service 的生命周期，页面实例相关变量需要自己想办法存储。因此推荐使用实例化的 Service，见下文。

## 实例化 Service

实例化 Service 同样有 6 个生命周期函数：

```javascript
// 构造函数
function Service(url, options) {
    // url 为当前页面 URL
    // options 为注册 Service 时第二个参数
}
// 入场前
Service.prototype.beforeAttach = function () {}
// 入场
Service.prototype.attach = function () {}
// 退场前
Service.prototype.beforeDetach = function () {}
// 退场
Service.prototype.detach = function () {}
// 销毁
Service.prototype.destroy = function () {}

rt.services.register('/foo', {title: {html: 'Todo List Detail'}}, Service)
```

其中 `beforeAttach`, `attach`, `beforeDetach`, `detach` 4 个生命周期函数的调用时机
分别对应单例 Service 的 `create`, `attach`, `detach`, `destroy`。
此外构造函数和 `destroy` 分别提供示例创建和销毁的回调。

> [Ralltiir Application][rt-app] 是采用实例化 Service 机制实现的 Service，可以直接使用。

## Service 编写建议

如需自行开发 Service 进行页面切换，以下是建议的实现方式（以单例 Service 为例）：

1. `create`：该回调发生在切换到一个Service时。建议此时进行入场动画，以及启动异步数据获取。
2. `attach`：该回调发生在切换到一个Service时，在上一个Service被destroy之后触发。建议进行视图渲染和重绘，事件绑定操作。
3. `detach`：该回调发生在当前Service将被移出时，在Service即将发生切换时立即触发。建议进行当前DOM状态的记录（比如滚动位置）。
4. `destroy`：该回调发生在当前Service被退场时（在上一个Service的create后触发），建议进行退场动画。在被移出Cache时也会触发，此时建议进行DOM移出和状态重置。

[rt-app]: https://github.com/Ralltiir/ralltiir-application
