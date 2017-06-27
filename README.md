# Superframe

[![Build Status](https://travis-ci.org/searchfe/superframe.svg?branch=master)](https://travis-ci.org/searchfe/superframe) [![Coverage Status](https://coveralls.io/repos/github/searchfe/superframe/badge.svg?branch=master)](https://coveralls.io/github/searchfe/superframe?branch=master)

* 官网：[http://superframe.baidu.com/][web]
* 编写 Service 可参考[起步教程][get-started]，其中的参考代码可以在[examples/](examples/)找到，使用静态HTTP服务器即可运行。
* 下载：在[发布页面][release]选择合适的版本下载。

## 框架开发指南

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

### 发布版本

所有发布的版本维护在 Superframe 官网：http://superframe.baidu.com/about/release.md
Push 代码即可触发构建，但官网的 release 文档需要手动更新。发布版本请遵循以下步骤：

1. 切换到 master

    ```bash
    git checkout master
    ```

2. 确保已合并所有改动

    ```bash
    git merge dev
    ```

3. 发布版本

    ```bash
    # 发布 patch 版本
    npm version patch
    # 发布小版本
    npm version minor
    # 发布大版本
    npm version major
    ```

### 生成API文档

将你的源码和文档文件映射添加到Makefile中，然后执行：

```bash
npm run doc
```

如何正确编写注释见下文。

> `npm run doc`使用`bin/doc.js`来完成文档生成工作，你可以继续增强它。

【注意】`docs/`目录是排除在Git之外的，每次Push代码时API文档会持续更新。访问链接：<http://superframe.baidu.com/frame/api/promise.md>

[web]: http://superframe.baidu.com/
[get-started]: http://superframe.baidu.com/get-started/1-hello-world.md
[release]: http://superframe.baidu.com/about/release.md
