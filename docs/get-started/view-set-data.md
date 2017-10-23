# 视图设置

除了在页面中写 HTML 之外，头部还可以用 JavaScript API 动态地设置。
此时头部的每个元素都有 HTML 和点击事件两项配置，它们都是可选的。

这一节介绍可以在脚本中动态调用的头部设置 API。

## 获得视图实例

通过 `<HTMLElement>.ralltiir` 来获得 `.rt-view` 元素对应的 Ralltiir 对象，它提供了视图相关的 API，可以用它来设置头部元素。

```javascript
var rt = document.querySelector('.rt-view.active').ralltiir
```

## 设置视图元素

获得视图实例后就可以用它设置视图内容和事件了。

```javascript
rt.setData({
    title: {
        html: '主标题',
        onClick: function () {
            console.log('主标题被点击')
        }
    },
    subtitle: {
        html: '副标题',
    }
})
```

更多 `.setData()` 的参数说明请参考 [视图参数](/get-started/view-options.md)。
