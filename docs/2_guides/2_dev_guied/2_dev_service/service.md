# 应用服务开发教程

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

本章节基于Superframe的阿拉丁卡片服务为范例，来介绍产品线在进行Superframe接入改造时。（未完待续）

### 模板改造建议
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