# 视图参数

视图参数是一个纯对象，它在 Ralltiir Application 中用来配置 [异步页面的视图][html]。
很多 API 都使用这一格式的参数，此处给出统一的说明。

## 一个例子

下面的 JavaScript 对象就是一个合法的视图参数。
它定义了标题、副标题、返回按钮，以及右侧工具，有一些还配置了点击事件处理函数。

```javascript
{
    name: 'baidu-zhaopin',
    title: {
        html: '主标题',
        onClick: function () {
            console.log('主标题被点击')
        }
    },
    subtitle: {
        html: '副标题',
    },
    back: {
        html: '<i class="c-icon">&#xe750;</i>'
    },
    actions: [{
        html: '<i class="c-icon">&#xxxxx;</i>',
        onClick: function () {
            console.log('第一个按钮被点击')
        }
    },{
        html: '<i class="c-icon">&#xxxxx;</i>'
    }];
}
```

## 参数说明

**视图参数** 中共有 4 项元素配置，分别是：

* `name`: 用来指定页面名字，同样名字的一组页面可以 [互相通信][messaging]。
* `title`：用来配置页面标题，它的值为一个 **元素配置**（见下文）。
* `subtitle`：用来配置副标题。注意移动页面很小，副标题一般用来显示位置信息、状态信息等。它的值为一个 **元素配置**。
* `back`：用来配置左侧返回按钮。它的值为一个 **元素配置**。
* `actions`：用来配置右侧工具按钮，建议一到两个。数组的每一项为一个 **元素配置**。

这 4 个项目每一项都是可选的。上述 **元素配置** 由两部分（都是可选的）构成：

* `html`：元素的 HTML 内容，为了添加事件处理函数可能会被包裹一个 `<span>`。
* `onClick`：点击事件处理函数，每次添加一个时当前配置的回调会失效。

从 ralltiir-application@4.1.2 开始支持单一字符串作为 **元素配置**，将被识别为 `html` 内容。
这在 [注册路由][register] 或通过 [SF 链接元素][link] 配置时会很有用。
例如 `{title: '这是一个标题'}` 即为一个合法的视图参数，相当于：

```
{
    title: {
        html: '这是一个标题'
    }
}
```

[html]: /get-started/html-structure.md
[register]: /get-started/router.md
[link]: /get-started/rt-link.md
[messaging]: /advanced/messaging.md
