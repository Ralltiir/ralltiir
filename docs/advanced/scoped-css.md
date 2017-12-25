# 样式局部化

Ralltiir 切换页面的过程中，存在两个页面共存的情况。
由于 CSS 是全局作用于，此时两个页面可能会相互影响。
因此需要对 CSS 进行局部化，下文介绍了如何进行 CSS 局部化。

如果未能做到样式局部化，需要通过 Service 上的设置来告知 Ralltiir，关闭对应的效果。

## 实现方式

基本原理是在 [.rt-view][rt-view] 的 DOM 上新增一个 class，然后站点样式中都添加 `.rt-view` 前缀。
由于 CSS 前缀会影响优先级，为样式表添加前缀的工作可能是递归的。
即所有依赖，以及所有依赖的依赖都需要添加前缀。

首先在 HTML 上增加前缀，比如 `.zhaopin`：

```html
<div class="rt-view zhaopin">
    <div class="rt-head">...</div>
    <div class="rt-body">...</div>
</div>
```

然后在样式编译时添加 `.zhaopin` 前缀。
如果你的构建工具是 [fis3][fis3]，加前缀只需要把所有样式文件过一次 less 编译即可：

```javascript
fis.config.set('modules.parser.less', [function (content, file, settings) {
    content = '.zhaopin {\n' + content + '\n}';
    file.setContent(content);
    return content;
}, 'less']);
```

> 注意：`html`, `head`, `body` 以及 `.rt-view` 上，前缀需要特殊处理。

## 强制样式隔离

如果未能完成样式局部化，或者第三方库升级导致冲突。这时只能依赖 Ralltiir 进行样式隔离。
这里介绍这一机制。

设置 `isolateCSS` 即可启用 CSS 隔离，记得设置 `name` 字段，
让 Ralltiir 识别同一个 Web App 的页面，在它们之间不会有效果降级。

```javascript
rt.services.register('/home', {
    title: 'Home',
    name: 'zhaopin',
    isolateCSS: true
}, Service);
```

由于要强制 CSS 隔离，不能允许两个页面共存。因此 Ralltiir 过渡态的效果会因此受到影响：

* 返回到其他 Service 时，没有返回动画
* 打开其他 Service 时，不可使用 DOM 缓存

[rt-view]: /get-started/html-structure.md
[fis3]: http://fis.baidu.com/
