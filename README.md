# Superframe

[![Build Status](https://travis-ci.org/Ralltiir/ralltiir.svg?branch=master)](https://travis-ci.org/Ralltiir/ralltiir) [![Coverage Status](https://coveralls.io/repos/github/Ralltiir/ralltiir/badge.svg?branch=master)](https://coveralls.io/github/Ralltiir/ralltiir?branch=master)

* 文档：<https://ralltiir.github.io/ralltiir/>
* 开发版本：<https://unpkg.com/ralltiir@2.5.15/dist/ralltiir.js>
* 压缩版本：<https://unpkg.com/ralltiir@2.5.15/dist/ralltiir.min.js>

Superframe前端极速浏览框架，是一种前端异步单页技术。 
点击超链接或浏览器跳转时，异步地获取数据并将内容展现给用户。
以此来减少用户等待时间，以及提高页面渲染速度。Superframe 主要特性如下：

* 更快的页面加速
* 更多的用户到达
* 更好的浏览体验
* 低成本的接入方式

## 安装

```bash
npm install -g ralltiir
```

## 异步渲染

Superframe 将同步的页面打开过程异步化，来减少用户等待和提供渲染优化的可能。

## 整体架构

Superframe 是由一系列技术构成的解决方案，为了最大限度地灵活和通用
Superframe 采取分层设计，产品方可通过编写 Service 来控制具体的页面入场、渲染和退场行为。
Superframe 整体架构中包括低层的 AMD 环境、 Superframe 框架核心。

## Roadmap

- [x] Assert 抽离
- [x] Promise 抽离
- [ ] Set-Immediate 抽离（文档、CI）
- [ ] http 抽离（文档、CI）
- [ ] cache 抽离（文档、CI）
- [ ] emitter 抽离（文档、CI）
- [ ] URL 抽离（文档、CI）
- [ ] map 抽离（文档、CI）
- [ ] Stream 抽离（文档、CI）
- [ ] lodash-mobile 抽离（文档、CI）

