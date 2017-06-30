# 4. sfr-cli工具使用

sfr-cli是解决产品线service接入环境问题的一个Linux like命令行工具。
为了方便快速简单接入，sfr-cli能够剥离具体开发环境，开发者只需关心自身接入业务改造。

## 安装

sfr-cli是一个npm包，依赖node 4.x及以上版本

> npm install -g sfr-cli

## 命令介绍

sfr-cli提供的命令行查看 `sf --help`

### sf init | sf i

> 初始化产品线开发目录和配置，脚手架功能

详见： `sf i --help`

### sf preview | sf p

> 预览调试命令

详见：`sf p --help`

## 使用教程

`sf init`后生成 `superframe.config.js`配置文件，配置文件所在目录为项目根目录。

### superframe.config.js配置文件

配置文件的配置说明如下：
```javascript
/**
 * @file superframe cli config
 * @author @superframe
 */

module.exports = {
    proxy: {
        // 代理环境的host, 默认代理到线上m.baidu.com
        host: 'm.baidu.com',

        // 代理环境的port, 默认为80端口
        port: 80
    },

    server: {
        // 启动服务器的端口
        port: 9999,

        // 是否允许跨域， 默认为true， 设置为false则需要将sf service的接口请求头origin设置为*
        crossDomain: true
    },
    // 注册superframe service path
    registers: [
        {
            // 产品线唯一标示
            id: 'graph',

            // 将要注册的path, path可以是string精准注册, 也可以是正则模糊注册
            path: /^\/sf_graph\//,

            // service文件存放目录，相对于根目录
            service: './services/graphService.js'
        }
        // ,
        // { 可以注册多个service path,   }

    ],

    // 入口mock， 结合将要访问的sf的path模拟aladdin入口
    paths: [
        {
            // 访问的path， 可以带querys
            path: '/sf_graph/search',
            
            // mock入口的别名
            alias: '多模图像搜索',

            // sf访问所带的query，刷新能带入同步环境
            querys: {
                sign: '23904e7c3be3acf22357d01481265862'
            },

           // data-sf-options的配置
            options: {
                view: {

                }
            },
            
            // 异步接口的host:port, 需要和service文件中的service异步服务url的host:port一致
            async: 'http://cp01-rdqa04-dev151.cp01.baidu.com:8991',

            // 同步环境的host:port，结合当前例子， 同步环境将自动访问 http://cp01-rdqa04-dev151.cp01.baidu.com:8991/search?sign=23904e7c3be3acf22357d01481265862
            sync: 'http://cp01-rdqa04-dev151.cp01.baidu.com:8991'
        }
        // , {可以多个入口path}
    ]
};

```

### service编写

本地环境开发和线上保持一致，需要自行开发将要注册的service
service的编写参照 [通用服务service](http://superframe.baidu.com/support/common-service/01-register.md)

service基本格式如下：

```javascript
define(['./commonService', '../resource/template'], function (CommonService, Template) {
    var graphService = new CommonService();
    
    graphService.commonViewOptions = {
        // 这里是头部的一些配置， headTitle, headBackgruond, customClassName, backHtml等
    };

    graphService.createTemplateStream = function (current) {
        var match = /^\/sf_graph\/search\?(.*)$/.exec(current.url);
        var url = '';
        if (match && match[1]) {
            url = 'http://cp01-rdqa04-dev151.cp01.baidu.com:8991/sf/async?' + match[1] + '&mod=1';
        }
        // url为具体访问的产品线sf异步接口
        return Template.createReadStream(url, {
            xhrFields: {
                withCredentials: false
            }
        });
    };

    return graphService;
});
```

### 开发预览

一切准备ok后，可以开始产品线superframe service了，首先执行`sf p`可以看到服务器ready

![sfr-cli-command](/img/get-started/sfr-cli-command.png)

看到当前的ip和port

我们可以进去访问 http://http://172.18.25.123:9999 , 可以看到真实的大搜首页， 此时输入任意的query则可以看到如下页面：

![sfr-cli-demo](/img/get-started/sfr-cli-demo.png)

这个时候，点击mock入口，则可以调试superframe是否接入成功，以及接入成功后的逻辑和样式规范等。





