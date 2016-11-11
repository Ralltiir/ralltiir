# 大搜索Superframe框架

官网：[http://superframe.baidu.com/][web]

## Get Started

> [examples/](examples/)下有API使用示例与App开发示例，
> 使用静态HTTP服务器即可运行。

只需引入Superframe的Script即可让当前页面变成一个Superframe App。
例如，在[examples/](examples/)下的`index.html`：

```html
<body>
  <a data-sf-href="/sf">Another Page</a>
  <script src="../../dist/sf.js"></script>
</body>
```

### 页面路由

每个页面由一个service控制，可以在入口页面中对路由进行控制。例如：

```javascript
require(['router/router','action','service/fooService','service/barService'], function(router, action, fooService, barService) {
    router.config({
        root: location.pathname
    });

    action.regist('/foo', new fooService());
    action.regist('/bar', new barService());

    router.start();
    action.start();
});
```

当访问`/foo`（通过上述的`data-sf-href`链接）时Superframe会调起`fooService`来接管页面逻辑：

### Service

`fooService`需要是`service`的一个实例，它的`create`, `attach`, `detach`, `destroy`等方法
会在生命周期的各阶段被调用。

例如，在创建时初始化一个视图（见下文），在加载到DOM时渲染该视图，在卸载时销毁视图。

```javascript
define(function () {
    var service = require('service');
    var fooView = require('fooView');
    var fooService = service.create();

    fooService.prototype.create = function() {
        fooView.create();
    };
    fooService.prototype.attach = function() {
        fooView.render('hello world!', 'This is a hello world demo page.');
        fooView.attach();
    };
    fooService.prototype.destroy = function() {
        fooView.destroy();
    };
    return indexService;
})
```

### View

视图用来渲染DOM和实现用户交互，通过Superframe的`view`来创建。
比如在创建时初始化一个DOM容器，在渲染时给出HTML内容。

```javascript
define(function() {
	var View = require('view');
    var myView = new View();

    myView.create = function() {
        this.$container = $('<div class="container"></div>');
        $('body').append(this.$container);
    }
    myView.render = function(header, body) {
        var html = [
            '<article>',
                '<header>' + header + '</header>',
                '<div>' + body + '</div>',
            '</article>'
        ].join('');
        this.$container.html(html);
	}
	return myView;
});
```

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

本仓库使用Karma作为Test Runner。关于Karma测试环境，请移步<http://***REMOVED***/psfe/karma-testing>，运行一次测试：

```bash
npm test
```

Karma测试环境可监测文件变化，现由于测试ESL模块需要先进行构建，需要手动build。
可先启动Karma监测build/dist目录（此时会立即运行一次测试）：

```bash
npm run test-watch
```

保持Karma处于运行状态，手动 Build 即可触发测试的执行：
 
```bash
npm run build
```

### 测试报告

生成测试结果（HTML格式）报告和覆盖率报告：

```bash
npm run test-coverage
# 或
npm run test-reports
# 测试结果报告
# ./build/test-reports/result
# 覆盖率报告
# ./build/test-reports/coverage
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
