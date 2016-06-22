# 接入指南

## 快速入门

本页面的主要目的有：

    1. 引导Superframe的服务使用者（包括PM/RD/FE）快速了解/掌握Superframe的整体接入方式，并从中选择出最适合自身产品线的接入方案；
    2. 引导RD/FE快速掌握自身服务接入方式的技术方案，便于快速介入开发；

### 优先阅读
    
了解如何选择资源的接入方式，请直接阅读：《实用教程：资源使用阿拉丁接入还是MIP接入》
了解详细阿拉丁接入方案：
    1. 卡片接入；
    2. JS模块接入；
    3. 应用服务接入；
了解MIP接入方案，请阅读本页《MIP接入》章节

## 阿拉丁接入
    
    Superframe阿拉丁接入分为卡片接入、应用服务接入、JS模块接入三种。
    技术上要求整体页面通过Superframe容器（Dom）渲染（非iframe形式）

#### 如何选择正确接入方式

**卡片接入**适用于：整体页面的数据资源可以通过阿拉丁平台（站长平台）提交的，例如：旅游、景点、城市等

**应用服务接入**适用于：整体产品本身有完整对外服务，并且无法进行阿拉丁数据提交的，例如：知道、百科、图片等

**JS模块接入**适用于：页面资源无法通过阿拉丁平台管理，并且服务无法符合Superframe应用服务接入标准的，例如：品专广告、老版本情景页JS等

### 卡片接入(推荐)

Superframe的页面是可以通过类似搜索结果页的卡片化的形式来组织的，所以Superframe服务提供了直接面向卡片开发的接入方案，在此方案的好处在于：

    1. 开发者无需关心整体页面的开发，通过开发多个卡片即可构建一个完整的Superframe情景页；
    2. 开发者在开发过程中，可以直接复用相同展现样式的卡片，无需进行额外重复工作；
    3. 开发者无需关系具体的统计逻辑，有通用的统计方案/机制来处理。

具体开发相关：[卡片开发传送门](http://sfe.baidu.com/#/superframe/card)

### 应用服务接入(推荐)

对于业务庞杂的产品线（例如：知道、百科、图片），Superframe也为此量身打造了合适的接入方式，便于产品线进行最小接入成本的服务改造。
服务进行接入时，需要满足《Superframe标准应用服务接入规范》

#### 接入要求概述

##### 服务path与接口

###### path
产品线需要提供Superframe页面url切换时的path定义，例如：结果页调起知道Superframe页面，则会异步将页面url从m.baidu.com/s切换为m.baidu.com/zhidao
而m.baidu.com/zhidao则是服务需要提供的。
###### 接口
产品线需要提供Superframe页面切换时的访问接口，以及接口规则，便于框架集成接口的fetch方法。

##### 返回数据格式

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

##### 页面JS规范

由于页面的JS代码是框架从服务提供的接口中提取的，所以框架在执行JS时，使用的是new Function方法，对于页面内部来说，所有代码都是在Superframe的沙盒执行的，在沙盒中，页面能全局使用的变量仅有global。如有其他需要全局使用的js变量，可以通过global.sandbox(object)来传递。对应的，JS书写有以下几个规则需要遵循：

JS变量不允许直接绑定在window上，使用的全局命名空间为global。

##### 页面CSS规范

###### 命名规范
CSS命名统一使用产品线缩写(产品线标识)- 开头

###### 选择器
一般情况下，使用class作为选择器

[了解详细规范]()

[了解接入流程]()

#### 产品线改造指南(coming soon)

##### 模板改造建议
##### JS开发建议
##### CSS开发建议

### JS模块接入

    对于卡片以及应用服务两种接入方式均无法使用的产品线，Superframe框架也提供了较为开放的JS模块接入方案。
    进行接入时，需要满足《Superframe JS模块接入规范》

#### 接入要求概述

##### 页面JS规范
参看[情景页JS规范](http://sfe.baidu.com/#/superframe/card/4、js+开发规范)
##### 页面CSS规范
参看[情景页CSS规范](http://sfe.baidu.com/#/superframe/card/3、css+开发规范)

[了解详细规范]()

[了解接入流程]()

#### 接入指南

[了解详细规范](http://sfe.baidu.com/#/superframe/card/7、actCard模式开发方式)

[了解接入流程]()

## MIP接入
### 适用场景
适用于外部资源引入，并且资源引入方式必须是站长整体页面。
如果外部资源合作方式是"结构化"数据，则推荐使用**阿拉丁接入**。
使用iframe页面的形式接入Superframe。
## 实用教程：资源使用阿拉丁接入还是MIP接入
