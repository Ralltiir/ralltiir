# 1. Hello World

Superframe是一个单页框架，提供了基于前端路由的页面切换机制，
以及前端App的一些常用工具如：underscore、promise、LRU cache等。

## 引入Superframe

目前只支持通过AMD模块的方式引入Superframe。

```html
<script src="http://s1.bdstatic.com/r/www/cache/ecom/esl/2-1-4/esl.source.js"></script>
<script src="path/to/sfr.js"></script>
```

## 编写第一个Service

Service是Superframe的调度单元，每个Service都控制着一个页面的出入场、
数据获取，以及页面渲染。

你的Service需要实现`create`, `attach`, `detach`, `destroy`等接口方法。
它们分别在入场、渲染、退场前、退场后被调用。

比如我们实现一个简单的Service（`hello-world.js`）：

```javascript
define('hello-world', ['sfr'], function() {
    var sfr = require('sfr');
    var helloWorldService = new sfr.service();

    helloWorldService.create = function() {
        var el = document.createElement('p');
        el.innerHTML = 'Hello World!';
        sfr.doc.appendChild(el);
    };

    return helloWorldService;
});
```

我们只实现`create`生命周期便可显示一段HTML。更多的生命周期方法请参考Service接口规范： </api/service.md>

注意：`sfr.doc`是由Superframe托管的DOM容器，所有Service的DOM节点都应以`sfr.doc`为Root。

## 启动路由

写好的Service需要注册到路由上方能使用，该操作应该在入口页面中进行。
例如我们将`hello-world`注册到根路径上：

```javascript
require(['sfr', 'hello-world'], function() {
    var sfr = require('sfr');

    sfr.action.regist('/', require('hello-world'));
    sfr.action.start({
        root: location.pathname
    });
});
```

这里我们为路由设置`root`是为了使Superframe可以工作在某个子路径下。
此时注册（`action.regist`）所用的Path相对于该子路径。

## 启动应用！

在[这里][hello-world]有一份完整的Hello-world代码，使用HTTP服务器启动它即可！

```
http-server
```

> 可以使用npm来安装一个HTTP server：`npm install -g http-server`。

打开`http://localhost:8080`接口看到Hello World显示在浏览器中：

![hello world screenshot][hello-world-screenshot]

[hello-world-screenshot]: /img/get-started/hello-world.png
