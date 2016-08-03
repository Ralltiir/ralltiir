# 大搜索Superframe框架

> 关于使用文档请移步[Superframe Docs][doc]。

## 环境准备

安装Make, fis3：

```bash
brew install make
npm install -g fis3
```

安装依赖：

```bash
npm install
```

## 运行测试

本仓库使用Karma作为Test Runner。关于Karma测试环境，请移步<***REMOVED***/psfe/karma-testing>，运行一次测试：

```make
make test
```

Karma测试环境可监测文件变化，现由于测试ESL模块需要先进行构建，需要手动build。
可先启动Karma监测build/dist目录（此时会立即运行一次测试）：

```bash
make watch
```

保持Karma处于运行状态，手动 Build 即可触发测试的执行：
 
```bash
make build
```

## 测试报告

生成测试结果（HTML格式）报告：

```bash
make html
open ./build/test/Chrome 51.0.2704 (Mac OS X 10.11.6)/index.html
```

生成覆盖率报告：

```bash
make coverage
open ./build/coverage/Chrome 51.0.2704 (Mac OS X 10.11.6)/index.html
```

生成所有测试报告：

```bash
make reports
```

[doc]: http://superframe.baidu.com/
