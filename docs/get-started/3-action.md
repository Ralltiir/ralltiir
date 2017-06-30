# 3. Action 路由

在superframe中Action用来注册与切换Service。
相关的路由信息会传递到service的生命周期方法中。

## URL匹配规则

Action支持注册多种格式的URL Pattern：字符串、RESTful字符串、正则表达式。
它们的匹配规则分别如下：

### 字符串

字符串全匹配URL中的path部分，基于[启动Action时的`root`配置][hello-world]。

例如对于下列root配置：

```javascript
sfr.action.start({
    root: '/root'
});
```

URL Pattern | 匹配的URL | 不匹配的URL
--- | --- | ---
`/foo`     | `/root/foo`, `/root/foo?author=harttle` |  `/root/foo/bar`
`/foo/bar` | `/root/foo/bar`, `/root/foo/bar?date=20161118`

### RESTful字符串

使用RESTful风格匹配path部分。以`root: '/root'`配置为例：

URL Pattern | 匹配的URL
--- | --- 
`/person/:id` | `/root/person/32`, `/root/person/harttle`
`/person/:id/code/:cid` | `/root/person/harttle/code/2333`

### 正则表达式 

使用正则表达式匹配path部分。

URL Pattern | 匹配的URL | 不匹配的URL
--- | --- | ---
`/person/(\d+)` | `/root/person/32` | `/root/person/harttle`
`/person/(\w+)/code/(\d+)` | `/root/person/harttle/code/2333` |

## 注册与跳转

为了接下来的实验，我们基于[编写 Service][service]一节中的
`index` service
来配置一些URL入口：

```javascript
// 字符串格式
sfr.action.regist('/', require('index'));
// RESTful
sfr.action.regist('/todos/:id', require('todo'));
// RegExp
sfr.action.regist(/\/lists\/(\d+)/, require('list'));
```

在`index`service渲染的页面中添加如下链接：

```javascript
<li><a data-sf-href="/todos/527">Todo 527</a></li>
<li><a data-sf-href="/lists/238">List 238</a></li>
```

`index`service渲染效果如下图所示：

![][img/index]

## Todo Service: RESTful路由

在`todo`Service的生命周期回调中可以得到RESTful URL匹配的路由参数。

```javascript
define(['sfr'], function() {
    var sfr = require('sfr');
    var todoService = new sfr.service();

    todoService.create = function(options) {
        this.el = document.createElement('div');
        this.el.innerHTML = 
            '<p>This is Todo ' + options.params.id + '!</p>' +
            '<p>Current Path:' + options.path + '</p>' +
            '<p>Current URL:' + options.url + '</p>';
        sfr.doc.appendChild(this.el);
    };

    todoService.destroy = function() {
        this.el.remove();
    };

    return todoService;
});
```

`options.params.id`即为注册的URL Pattern `'/todos/:id'` 的匹配结果。

![][img/rest]

## List Service: RegExp路由

在`list`Service的生命周期中可以得到正则匹配得到的路由参数。

```javascript
define(['sfr'], function() {
    var sfr = require('sfr');
    var todoService = new sfr.service();

    todoService.create = function(options) {
        this.el = document.createElement('div');
        this.el.innerHTML = 
            '<p>This is List ' + options.params.$1 + '!</p>' +
            '<p>Current Path:' + options.path + '</p>' +
            '<p>Current URL:' + options.url + '</p>';
        sfr.doc.appendChild(this.el);
    };

    todoService.destroy = function() {
        this.el.remove();
    };

    return todoService;
});
```

`options.params.$1`即为注册的URL Pattern `/\/lists\/(\d+)/` 的匹配结果。如果有第二个**正则获取组(capturing group)**则位于`$2`下，以此类推。

![][img/regexp]

[hello-world]: ./1-hello-world.md
[service]: ./2-service.md
[img/index]: /img/get-started/action-index.png
[img/regexp]: /img/get-started/action-regexp.png
[img/rest]: /img/get-started/action-rest.png
