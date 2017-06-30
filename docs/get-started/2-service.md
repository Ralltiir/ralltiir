# 2. 编写 Service

除了`create`外，Service还具有`attach`, `detach`, `destroy`等生命周期方法。
它们分别在入场、渲染、退场前、退场后被调用。
借此可以实现DOM缓存、数据预取、Service切换，以及出入场动画等。
下面我们来实现service切换。

## 注册多个 Service

首先我们需要注册多个service，它们可以在不同的路径下：

```javascript
require(['sfr', 'index', 'foo'], function() {
    var sfr = require('sfr');

    sfr.action.regist('/', require('index'));
    sfr.action.regist('/foo', require('foo'));

    sfr.action.start({
        root: location.pathname
    });
});
```

如果你希望service是不同的实例，只需要在这里create一下：

```javascript
sfr.action.regist('/foo', Object.create(require('foo')));
```

## Service 接口规范

上述代码中用到了`index`和`foo`两个模块，我们现在把它们实现为两个Service。
先看一个service骨架：

```javascript
define('index', ['sfr'], function() {
    var sfr = require('sfr');
    var indexService = new sfr.service();

    indexService.create = function() {
        console.log('[indexService] create');
    };

    indexService.attach = function() {
        console.log('[indexService] attach');
    };

    indexService.detach = function() {
        console.log('[indexService] detach');
    };

    indexService.destroy = function() {
        console.log('[indexService] destroy');
    };

    return indexService;
});
```

这些生命周期函数都是可选的，在页面入场时会顺序调用`create`和`attach`，出场时顺序调用`attach`和`destroy`。

## 创建和销毁 DOM

典型的场景中，我们在`create`回调创建当前页面的DOM。
下面是`index`Service的`create`实现，其中添加了到`foo`Service的链接。

```javascript
indexService.create = function() {
    this.el = document.createElement('div');
    this.el.innerHTML = [
        '<p>This is index service!</p>',
        '<a data-sf-href="/foo">To Foo Service</a>'
    ].join('\n');
    sfr.doc.appendChild(this.el);
};
```

注意这里的链接需要写成`data-sf-href`的形式，superframe才会接管其路由。
在`destroy`回调中销毁当前页面的DOM。

```javascript
indexService.destroy = function() {
    this.el.remove();
};
```

## Service 切换

按照`index`的实现方式，写一个对称的`foo`Service。其中的链接改为到`index`的链接。
启动静态服务器并打开`index`页面，就可以通过链接在两个service之间切换了：

![service switch screenshot][service-screenshot]

> 在日志中记录了启动index并切换到foo，所发生的生命周期过程。

## 动画相关

* `create`发生在上一个service `destroy`之前，此时可以开始入场动画。
* `attach`发生在上一个service `destroy`之后，此时可以进行渲染。
* `detach`发生在下一个service `create`之前，此时当前service还未退场可以记录一些页面状态。
* `destroy`发生在上一个service `create`（入场）之后，可以自由地进行销毁。

关于生命周期的内部机制请参考：</advanced/life-cycle.md>

[service-screenshot]: /img/get-started/service-switch.png

