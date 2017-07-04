# 框架 Debug

使用开发版的 Ralltiir 可以启用框架核心的调试功能。
在调试模式下，Ralltiir 提供了详细的页面调起和渲染日志。
为了支持移动端调试，可以通过 URL 参数来指定将调试日志实时发送到服务器。

## 下载安装

需要首先在[发布][release]页面选择“development”版本下载后部署在你的环境中。
如果在测试环境中，需要更新测试环境代码中对应的 Ralltiir 源码。

## 调试日志

在打开容器页（第一个让浏览器访问的 URL） 时，在浏览器控制台就可以看到 Ralltiir 框架日志了。例如：

```
http://localhost:8080/
```

## 移动设备调试

在移动设备调试时，可以将 debug 日志发送到某台服务器，
需要增加`debug-server=xxx`参数。例如：

```
http://localhost:8080/path?debug-server=http://example.com
```

> 注意`debug-server`可能需要`encodeURIComponent`。

[release]: https://github.com/ralltiir/ralltiir/release
