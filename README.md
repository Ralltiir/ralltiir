# Ralltiir

[![Build Status](https://travis-ci.org/Ralltiir/ralltiir.svg?branch=master)](https://travis-ci.org/Ralltiir/ralltiir) [![Coverage Status](https://coveralls.io/repos/github/Ralltiir/ralltiir/badge.svg?branch=master)](https://coveralls.io/github/Ralltiir/ralltiir?branch=master)

* 文档：<https://ralltiir.github.io/ralltiir/>
* 开发版本：<https://unpkg.com/ralltiir@2.5.15/dist/ralltiir.js>
* 压缩版本：<https://unpkg.com/ralltiir@2.5.15/dist/ralltiir.min.js>


## 简介

Ralltiir 前端极速浏览框架，是一种前端异步单页技术。
点击超链接或浏览器跳转时，异步地获取数据并将内容展现给用户。
以此来减少用户等待时间，以及提高页面渲染速度。
Ralltiir的核心理念是让页面间的跳转变得更流畅、平滑且有交互感。
Ralltiir 主要特性如下：

* 更快的页面加速
* 更多的用户到达
* 更好的浏览体验
* 低成本的接入方式

## 整体架构

Ralltiir 是由一系列技术构成的解决方案，为了最大限度地灵活和通用。

Ralltiir 采取分层设计，产品方可通过编写 Service 来控制具体的页面入场、渲染和退场行为。

Ralltiir 整体架构中包括低层的AMD环境、 Ralltiir框架核心。

## Ralltiir 技术原理

Ralltiir的路由主要实现

1、注册Service到URL

2、监听URL的变化：通过监听浏览器的popstate，劫持超链接点击实现。

3、当URL变化时，根据已注册配置，创建Service并完成新旧Service的切换。


<br>
Ralltiir也提供了一些其他可选用的解决方案，如：

1、Partical Update 复用view机制进行局部更新（不产生历史）

2、Performance 性能监控

3、Transition 动画


## 安装

推荐通过 APM 安装和使用 ralltiir。

```bash
# 安装 apm
npm install -g apmjs
# 安装 ralltiir
apmjs install --save ralltiir
```

## 使用Superframe技术

你可以从编写Service开始，创造出支持任何需求的基于Ralltiir的SPA应用，你可以在[Ralltiir 教程](https://ralltiir.github.io/ralltiir/)获得支持。

但是当您的产品业务希望使用Ralltiir技术，却又没有深度定制的需求的时候，也可以采用我们提供的 [Ralltiir Application](https://ralltiir.github.io/ralltiir-application/)的集成方案快速实现，Ralltiir Application已经实现了一个常见的SPA容器页及页面过渡效果。
