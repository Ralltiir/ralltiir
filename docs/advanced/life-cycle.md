# 生命周期概述

本文介绍 Ralltiir 中 Service 的**生命周期方法**调用时机。
注意**生命周期方法** 是指Service内部方法，业务代码请使用
[Ralltiir 事件](/advanced/events.md)。

## 单例 Service

Ralltiir中切换Service时涉及前后两个Service生命周期回调的执行，例如在从 `prev` Service 切换到 `current` Service 时，
二者的生命周期回调会以下列顺序执行：

1. prev.detach
2. current.create
3. prev.destroy
4. current.attach

在默认情况下（生命周期函数未实现或实现为空），上述四个函数会被顺序调用。
任何一个抛出同步异常都会使得后续函数不会被调用。
此时Ralltiir认为你的Service存在Fatal Error，请自行查看控制台的错误栈。

除此之外，四者都可返回Promise，在此情况下上述列表中后一个回调会等待前一个该Promise resolve。
任何一个Promise被reject都会导致后续生命周期回调不被执行（错误栈仍然被抛出在控制台中）。
四者都被顺序执行结束后，Dispatch运行完成。

## 实例化 Service

实例化 Service 除了页面切换的 4 个生命周期函数之外，还有两个生命周期函数：创建和销毁。
其中创建直接使用 JavaScript 的构造函数，销毁则约定为 `.destroy()` 实例方法。

下图是实例化 Service 的一次页面切换流程：

![dispatch flowchart](/img/dispatch.png)

上图中每个颜色表示一个 Service 实例，注意不同的实例可能来自同一个类。

## 避免并发问题

快速点击前进/后退时 Ralltiir 的页面切换存在并发问题。
即在一个Dispatch尚在执行过程中，下一个Dispatch仍然可能会被触发。
这一问题的本质在于：

* 用户操作需要立即响应。
* 异步过程（定时器、ajax、Promise）不可暂停。

> 例如：Service载入过程中（生命周期回调返回的Promise仍然pending的状态），用户触发了浏览器返回。
> 此时两个Dispatch流程并发进行，于是生命周期会乱序交替执行。此时Service状态和DOM状态可能会Crash。

为了使返回操作立即响应，Ralltiir并未等待互斥操作顺序执行，
而是跳过当前Dispatch流程中后续的生命周期回调，并立即开始下一个Dispatch流程。
这要求Service实现中遵守以下惯例：

**每个生命周期回调中不应等待异步过程，异步数据可以交给框架来等待**。

推荐的做法是在`create`中进行入场动画，以及启动异步的数据获取。
然后在`attach`中同步地渲染数据。下面是一个示例：

```javascript
// 不推荐的方式：
MyService.create = function(){
    http.get('/url').then(function(data){
        $('.container').html(data);
    });
}
// 推荐的方式：
var data;
MyService.create = function(){
    return http.get('/url').then(function(_data){
        data = _data;
    });
}
MyService.atttach = function(){
    $('.container').html(data);
}
```

异步方法需要做好兼容，因为数据到达时Service状态可能已经发生变化，例如：

```javascript
MyService.attach = function(){
    $('.some-link').click(function(){
        // 在attach之后再去请求数据（不推荐）
        http.get('/something').then(function(data){
            // 这时MyService.destroy可能已经被调用（比如用户手比较快马上点了返回）
            // 所以$('.content')已经length==0了
            $('.content').html(data);
        });
    });
};
MyService.destroy = function(){
    // 销毁时可能会干掉一些东西
    $('.content').remove();
};
```

> 为了方便示例上述DOM渲染直接在Service中进行，可以放到View中来达到更好的封装和复用。
