# 文档

## 开发指南
### 卡片
### JS模块
### 标准应用服务
### MIP

## 框架基础
Superframe框架整体思想也是源于业界MV*模式的思想。框架包含以下几个核心模块

**Router模块：**进行框架整体的路由控制。

**Action模块：**直接面向开发者，提供整体页面动作（reset、back、redirect等）控制接口，提供动作管理（on、remove、run）接口。

**View模块：**提供统一的dom结构、展现样式及交互动画。每一个页面对应一个View实例，View统一通过ViewFactory管理。

**ViewModel模块：**进行页面数据管理（数据收、发）与Dom渲染（全局或局部），VM内部所有执行逻辑都在沙盒执行，与外部框架、容器解耦。

**Activity模块：**Acivity用于描述整个页面的生命周期，在页面切换时，也会进行两个页面Acitivty的生命的交互执行。
### Router
### Action
### View
### ViewModel
### Activity
