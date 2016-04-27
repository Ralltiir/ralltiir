# Demo演示
## Hello SuperFrame
    让我们现在来做一个简单的hello world的demo吧

### 1. 入口HTML
    我们需要一个入口的HTML来进行superframe的调起与展示。在这个HTML里面，我们来进行依赖模块的加载，与界面的相应

### 2. 加载依赖库
    SuperFrame是有依赖的，所以我们需要加载superframe所需要的依赖
    `
    <!--ESL库可以酌情换成其他框架，如requirejs等-->
    <script src="./static/js/lib/esl.js"></script>
    <!--同样的，zepto也可以替换成jquery-->
    <script src="./static/js/lib/zepto.js"></script>
    <!--HASH_LIB目前必须要引入，后续会解除依赖-->
    <script src="./static/js/lib/hash_lib.js"></script>
    <!--我们的一些配置项,稍后会解释-->
    <script src="./static/js/lib/esl_config.js"></script>
    `
### 3. AMD配置
    在esl_config.js中，有一些写好的方法，需要我们配置的有这几处：
    #### 1. 静态文件寻找路径，例：
        `
        require
        .config({
            baseUrl: './static/js/',
        });
        `
    #### 2. 配置activity，提前告诉superframe框架，我们准备了哪些activity，在这里我们准备了一个myActivity，作为activity的样例。
        `
        B.amd.addPaths({
            'app/myActivity': 'app/myActivity.js'
        });
        `
### 4. 调用页面整体的controller










