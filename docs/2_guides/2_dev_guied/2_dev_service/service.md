# 应用服务开发教程

本章节通过接入流程、接入要求、基本环境和联调测试几个小节来引导RD/FE进行应用服务的接入。同时通过改造指南来引导产品线自身进行接入Superframe应用服务的改造。

## 服务接入流程

1. 服务方与Superframe团队确定具体产品线业务；
2. 服务方按照规范进行页面开发；
3. Superframe团队进行框架服务接入配置，并与服务方联调；
4. 服务方上线对应代码，Superframe框架开放调起；

## 接入要求概述

服务接入时，需要满足以下规范：

> 1. 提供服务接入path与数据接口

> 2. 数据接口返回格式

> 3. 页面JS规范

> 4. 页面css规范

> 5. 页面生命周期规范 

## 框架运行环境

> zepto.js

> esl.js

> superframe frame

## 联调测试

### Superframe框架环境

Superframe团队会提供基于检索结果页的Superframe框架环境，产品线进行联调、测试或者上线预览时，均可以通过 Superframe的环境来进行Superframe调起后页面的效果检查。

## 产品线改造指南

本章节基于Superframe的阿拉丁卡片服务为范例，来介绍产品线在进行Superframe接入改造时。

### 模板改造建议

至少需要一个同步模版及一个异步模版，用以在不同的请求方式下返回html片段。

同步模版包含完整的html head body结构，例如：

```
<!DOCTYPE html>
<html>
    <head>
        <meta ... />
        <style>头部css</style>
        <script>头部js</script>
    </head>
    
    <body>
        <div>各种dom</div>
        <script>框架js</script>
        <script>业务js</script>
    </body>
</html>
```

异步模版可以采用template标签分段，异步渲染时方便js拆分并插入dom或执行js，例如：

```
<template id="sf_async_head_js">
    <script>头部js</script>
</template>

<template id="sf_async_body">
    <div>各种dom</div>
</template>

<template id="sf_async_foot_js">
    <script>业务js</script>
</template>
```


### JS开发建议

1、全局变量

在页面中只暴露必须的全局变量，如page、view，分别用来绑定全局变量方法及传递页面事件。

当页面异步打开时，框架会以new function方式创建js执行沙河环境，约定沙盒唯一对外暴露的全局变量为_global_，因此，为了兼容同步异步环境，可采用以下方法初始化全局变量：

```
    if (typeof(_global_) != 'undefined') {
        _global_.view = new View;
        _global_.page = {};
    } else {
        window.view = new View;
        window.page = {};
    };
```

之后即可正常使用page、view变量（勿加window对象）

2、生命周期

页面需要向框架传递生命周期状态，例如：
```
    view.trigger('ready');  // 表示dom ready
    view.trigger('init');   // 框架js加载完毕
```

3、组件化

所有js采用amd组件规范开发并使用，amd组件的key不应该固定，应该与目录结构相同，内联使用时，require均使用相对路径，例如：

```
    define(function () {
        return EventEmitter;
    });
    
    require(['../utils/eventEmitter', '../card/cardT'], function(View, Card) {
        // do sth
    });
```

js文件结构可参考http://sfe.baidu.com/sf/#./docs/2_guides/3_frame_guied/sf_app/2.javascript.md



### CSS开发建议

由于大搜结果页及大部分服务均全量引入了PMD：http://pmd.baidu.com/

因此建议以此作为基础css框架使用，保证样式及产品体验统一。

其它框架必要的css文件应在同步模版头部加载，同时在框架view层中单例加载。

CSS命名统一使用产品线缩写 (产品线标识)- 开头；并统一使用class作为选择器。
