# Superframe阿拉丁应用服务开发教程

## 接入要求概述

### 服务path与接口

#### path
产品线需要提供Superframe页面url切换时的path定义，例如：结果页调起知道Superframe页面，则会异步将页面url从m.baidu.com/s切换为m.baidu.com/zhidao
而m.baidu.com/zhidao则是服务需要提供的。
#### 接口
产品线需要提供Superframe页面切换时的访问接口，以及接口规则，便于框架集成接口的fetch方法。

### 返回数据格式

数据接口返回的MIME统一为：text/html

返回的数据格式有以下要求：

1. 每个文本块都使用以下标签定义方法包装：
    <template id="moduleId"></template>
2. mouduleId有白名单，目前提供的moduleId有：
    ```
    <template id="sf_async_head_js">
        {%* 头部js 直接输出不带script标签的js代码 *%}
    </template>

    <template id="sf_async_body">
        {%* 正文部分，输出DOM，不包含JS *%}
    </template>

    <template id="sf_async_merge_js">
        {%* 全局变量 直接输出不带script标签的js代码 *%}
    </template>

    <template id="sf_async_foot_js">
        {%* 底部js 直接输出不带script标签的js代码 *%}
    </template>
    ```

### 页面JS规范

由于页面的JS代码是框架从服务提供的接口中提取的，所以框架在执行JS时，使用的是new Function方法，对于页面内部来说，所有代码都是在Superframe的沙盒执行的，在沙盒中，页面能全局使用的变量仅有global。如有其他需要全局使用的js变量，可以通过global.sandbox(object)来传递。对应的，JS书写有以下几个规则需要遵循：

JS变量不允许直接绑定在window上，使用的全局命名空间为global。

### 页面CSS规范

#### 命名规范
CSS命名统一使用产品线缩写(产品线标识)- 开头

#### 选择器
一般情况下，使用class作为选择器

[了解详细规范]()

[了解接入流程]()

### 产品线改造指南(coming soon)

#### 模板改造建议
#### JS开发建议
#### CSS开发建议

