# 大搜索Superframe框架

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

本仓库使用Karma作为Test Runner。关于Karma测试环境，请移步<http://gitlab.baidu.com/psfe/karma-testing>，运行一次测试：

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

## 注释指南

Superframe API 文档采取自动生成的方式，这依赖于正确的代码注释。
这些注释将会被`bin/doc.js`解析并生成GFM文档，本文介绍了如何正确地编写`doc.js`可以识别的注释。

### 函数说明

最简单的注释就是函数说明：

```javascript
/*
 * This is an awesome function created by Harttle!
 */
function hello(){
    console.log('Hello Superframe!');
}
```

在所有注释标记之前的文字将被解析为函数说明，即：

```
This is an awesome function created by Harttle!
```

### 函数签名

doc.js可以自动解析函数签名，括以下几种函数定义都可以被正确解析：

```javascript
// file: sample.js
function foo(bar, coo){
    // ...
}
var foo = function(foo, bar){
    // ...
}
```

解析后的函数签名为：

```javascript
Sample#foo(bar, coo)
Sample#foo(foo, bar)
```

> 默认情况下函数被解析为实例方法（instance method）

### 静态函数

静态函数（static method）必须添加`@static`注释，例如文件`Promise`中的`all`方法：

```javascript
/*
 * @static
 */
function all(){}
```

解析后的函数签名为：

```
Promise.all()
```

### 私有函数

私有函数不生成任何文档，可以由一下任何一种方式来声明：

#### 添加private注释

```javascript
/*
 * @private
 */
function foo(){}
```

#### 函数名下划线前缀

```javascript
function _foo(){}
```

### 函数参数

函数参数文档需要在注释中通过`@param`标记给出，例如：

```javascript
/*
 * Create a slice of string within the region [start, ).
 * @param {String} str The string to be sliced.
 * @param {Number} start The start index.
 * @param {Number} end The end index.
 */
function slice(str, start, end){}
```

大括号中声明类型，可以是任何字符串；紧接着是参数名；后续字符串为参数描述。

### 返回值

函数返回值通过`@param return`来标记，例如：

```javascript
/*
 * Create a slice of string within the region [start, ).
 * @return {String} The result string.
 */
function slice(str, start, end){}
```

返回值注释方式与参数一样，除了不需要声明参数名称。

### 示例代码

示例代码可通过`@example`标记来声明，例如：

```javascript
/*
 * An empty function.
 * @example
 * foo('harttle');     // logs: harttle hello
 * foo('harttle', 'how are you');     // logs: harttle how are you
 */
function greeting(name, greet){
    console.log(name, greet || 'hello');
}
```

示例代码将被解析为GFM代码块。

[web]: http://superframe.baidu.com/
[get-started]: http://superframe.baidu.com/get-started/1-hello-world.md
[release]: http://superframe.baidu.com/about/release.md
