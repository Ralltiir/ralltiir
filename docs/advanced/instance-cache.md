# Service 实例缓存

本文介绍 Service 实例的缓存机制，继续阅读之前请确保你的 Service 以实例的方式注册。
单例方式注册的 Service 页面缓存是由 Service 自行实现的。

Ralltiir 默认开启了页面缓存，上限默认为 16 个页面。超过上限时将采用 [LRU][lru] 策略移除最不常使用的页面（往往是第一个页面或者第一次点出的页面）。

## 一个例子

例如页面缓存个数为 2 个，按照以下步骤操作：

1. 打开页面 A
2. 从页面 A 打开页面 B
3. 从页面 B 打开页面 C，A 的缓存被销毁

此时，*从页面 C 打开页面 B* 或 *从页面 C 返回到页面 B* 都会命中缓存；
*从页面 C 打开页面 A* 或 *从页面 C 返回两次到页面 A* 则会刷新页面 A。

## 设置缓存数目

```javascript
var rt = require('ralltiir')
rt.services.setInstanceLimit(8);
```

## 未使用缓存的原因

* 超过缓存数目限制。
* 渲染发生异常。往往是产品线代码中抛出了异常，此时会触发 Ralltiir 容错机制而跳转同步页面。调试时建议开启 Preserve Log 选项。
* 没有使用异步跳转。异步跳转有 `action.redirect` 和 `[data-sf-href]` 两种方式，其他情况是非 Ralltiir 跳转。
* 页面部分重新渲染，但没有发生重新载入。这可能是 Atom 或其他 JavaScript 逻辑造成的，请检查相关业务逻辑。


[lru]: https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU
