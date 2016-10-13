# 大搜索Superframe框架

官网：[http://superframe.baidu.com/][web]

## Get Started

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
make dist
```

打包的结果文件在`dist/`目录下。

### 运行测试

本仓库使用Karma作为Test Runner。关于Karma测试环境，请移步<http://***REMOVED***/psfe/karma-testing>，运行一次测试：

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
make build
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

[web]: http://superframe.baidu.com/
