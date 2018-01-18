# 框架 Debug

Ralltiir 内置了调试代码，包括控制台输出和事件输出（见下文）。
默认情况下调试日志是禁用的，需要通过开关来启用。

## 日志内容

日志内容无所不有。从路由操作，到页面渲染，再到依稀一些关键的实现逻辑。
这些日志的产生方式有两种：

1. 控制台。在开启时，控制台会输出所有日志，这些日志的发送方包括 Ralltiir 框架本身，也包括使用 Ralltiir 中这一日志机制的其他模块。
2. 日志事件。在每次发送日志时，日志模块上会产生一个日志事件，示例见下文。

> 注意：本文所称日志是指调试日志，仅用于调试，其他模块不可依赖这一逻辑，也不可用于用户行为收集。

## 日志开关

日志开关很简单：在同步页面（打开浏览器后你访问的第一个页面就是同步页面）的 URL 上添加对应的参数即可：

* `rt-debug`：启用 Ralltiir 日志。
* `rt-debug-timming`：启用 Ralltiir 时间日志，用于渲染、网络性能统计。

rt-log-timming

例如：访问 `http://m.baidu.com/s?word=北京&rt-debug=true` 即可在控制台查看日志，日志事件也会触发。

> 其实 rt-debug 的值不重要，只要它出现在 URL 中即可生效。

## 日志事件

打开日志后，除了在控制台可以看到，也可以监听日志事件。例如：

```javascript
var rt = require('ralltiir')
rt.logger.on('warn', args => {
    (new Image).src = 'http://example.com?level=warn&msg=' + encodeURIComponent(args.join(' '))
})
```

这样就可以把日志发到服务器啦，方便手机端调试。其中事件名包括：

* `log`： 日志
* `debug`：调试日志，通常是程序员无聊的时候发的。
* `info`：信息
* `warn`： 警告
* `error`：错误

