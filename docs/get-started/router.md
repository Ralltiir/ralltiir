# 路由注册

在 Ralltiir 中每个需要异步打开的 URL 都需要注册，不匹配的 Ralltiir 跳转会导致 JavaScript 错误。
可以为每个 URL Pattern 配置一个接管它的 Service。例如：

```javascript
// 字符串格式
rt.services.register('/', {}, require('index'));
// RESTful
rt.services.register('/todos/:id', {}, require('todo-service'));
// RegExp
rt.services.register(/\/lists\/(\d+)/, {}, require('list-service'));
```

* URL Pattern。第一个参数可以是字符串、Rest字符串、正则表达式，见下文。
* View Options。第二个参数是 [视图参数][view-options]。
* Service。第三个参数是接管的 Service，比如 `"ralltiir-application/service"`。

## 字符串

字符串全匹配URL中的path部分，基于启动 Action 时的`root`配置，默认为 `'/'`。
例如对于下列root配置：

```javascript
rt.action.start({
    root: '/root'
});
```

URL Pattern | 匹配的URL | 不匹配的URL
--- | --- | ---
`/foo`     | `/root/foo`, `/root/foo?author=harttle` |  `/root/foo/bar`
`/foo/bar` | `/root/foo/bar`, `/root/foo/bar?date=20161118`

## RESTful字符串

使用RESTful风格匹配path部分。以`root: '/root'`配置为例：

URL Pattern | 匹配的URL
--- | --- 
`/person/:id` | `/root/person/32`, `/root/person/harttle`
`/person/:id/code/:cid` | `/root/person/harttle/code/2333`

## 正则表达式 

使用正则表达式匹配path部分。

URL Pattern | 匹配的URL | 不匹配的URL
--- | --- | ---
`/person/(\d+)` | `/root/person/32` | `/root/person/harttle`
`/person/(\w+)/code/(\d+)` | `/root/person/harttle/code/2333` |

[view-options]: /get-started/view-options.md
