# Superframe

[![Build Status](https://travis-ci.org/searchfe/superframe.svg?branch=master)](https://travis-ci.org/searchfe/superframe) [![Coverage Status](https://coveralls.io/repos/github/searchfe/superframe/badge.svg?branch=master)](https://coveralls.io/github/searchfe/superframe?branch=master)

## 使用Superframe

Superframe是一个页面异步解决方案。

主要用于解决页面与页面的跳转体验糟糕的问题。

我们期望通过Superframe让Web的页面跳转也像Native App一样流畅。

了解更多信息，访问[Superframe Docs](https://searchfe.github.com/superframe)

## 开发指南

### 环境准备

安装Node.js(版本>=4), Make, fis3:

```bash
brew install make
npm install -g fis3
```

安装依赖：

```bash
npm install
```

### 构建打包

```bash
# 打包
npm run dist
```

打包的结果文件在`dist/`目录下。

### 运行测试

本仓库使用Karma作为Test Runner。运行一次测试：

```bash
npm test
```

### 测试报告

生成测试结果（HTML格式）报告和覆盖率报告：

```bash
npm run test-reports
# 测试结果报告
# ./build/test-reports/result
# 覆盖率报告
# ./build/test-reports/coverage
```

[web]: http://superframe.baidu.com/
[get-started]: http://superframe.baidu.com/get-started/1-hello-world.md
[release]: http://superframe.baidu.com/about/release.md
