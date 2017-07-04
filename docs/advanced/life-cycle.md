# 生命周期概述

Ralltiir Service、View都提供了生命周期的托管。
其中View的生命周期由Service自行调用。本文主要介绍Service的生命周期。

## 声明周期回调

在创建Service实例时，需要继承自Ralltiir提供的Service基类。
该基类提供了生命周期回调接口（实现为空函数）。子类可实现其中任何一个的行为。包括：

1. `create`：该回调发生在切换到一个Service时。建议此时进行入场动画，以及启动异步数据获取。
2. `attach`：该回调发生在切换到一个Service时，在上一个Service被destroy之后触发。建议进行视图渲染和重绘，事件绑定操作。
3. `detach`：该回调发生在当前Service将被移出时，在Service即将发生切换时立即触发。建议进行当前DOM状态的记录（比如滚动位置）。
4. `destroy`：该回调发生在当前Service被退场时（在上一个Service的create后触发），建议进行退场动画。在被移出Cache时也会触发，此时建议进行DOM移出和状态重置。

> 同一个Service的上述声明周期会被多次调用。构造过程需要提供构造函数，析构过程可以防止destroy中（需要做好与退场动画的兼容）。

## Service切换

superframe中切换Service时涉及前后两个Service生命周期回调的执行，例如在从`prev`Service切换到`current`Service时，
二者的生命周期回调会以下列顺序执行：

1. prev.detach
2. current.create
3. prev.destroy
4. current.attach

在默认情况下（生命周期函数未实现或实现为空），上述四个函数会被顺序调用。
任何一个抛出同步异常都会使得后续函数不会被调用。
此时Superframe认为你的Service存在Fatal Error，请自行查看控制台的错误栈。

除此之外，四者都可返回Promise，在此情况下上述列表中后一个回调会等待前一个该Promise resolve。
任何一个Promise被reject都会导致后续生命周期回调不被执行（错误栈仍然被抛出在控制台中）。
四者都被顺序执行结束后，Dispatch运行完成。

## 时序冲突与编程惯例

在一个Dispatch尚在执行过程中，下一个Dispatch仍然可能会被触发。
典型的情形如：Service载入过程中（生命周期回调返回的Promise仍然pending的状态），用户触发了浏览器返回。
此时两个Dispatch流程并发进行，于是生命周期会乱序交替执行。此时Service状态和DOM状态可能会Crash，因为对于任何一个Service：

1. **create和destroy是互斥的，二者不可并发**
2. **attach和detach是互斥的，二者不可并发**
3. **attach和detach必须发生在create之后，destroy之前**

为了使返回操作立即响应，Superframe并未等待互斥操作顺序执行，
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
