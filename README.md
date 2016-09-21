## 大搜索Superframe框架

### 相关链接

* 关于使用文档，请移步[Superframe Docs][doc]。
* 关于编码规范和设计文档，请移步[wiki][wiki]

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
make dist
```

打包的结果文件在`dist/`目录下。

### 运行测试

本仓库使用Karma作为Test Runner。关于Karma测试环境，请移步<http://gitlab.baidu.com/psfe/karma-testing>，运行一次测试：

```bash
make test
# 或
npm test
```

Karma测试环境可监测文件变化，现由于测试ESL模块需要先进行构建，需要手动build。
可先启动Karma监测build/dist目录（此时会立即运行一次测试）：

```bash
make test-watch
```

保持Karma处于运行状态，手动 Build 即可触发测试的执行：
 
```bash
make test-build
```

### 测试报告

生成测试结果（HTML格式）报告和覆盖率报告：

```bash
make test-coverage
# 或
npm run test-reports
# 测试结果报告
# ./build/test-reports/result
# 覆盖率报告
# ./build/test-reports/coverage
```

[doc]: http://superframe.baidu.com/
[wiki]: http://gitlab.baidu.com/psfe/superframe/wikis/home
