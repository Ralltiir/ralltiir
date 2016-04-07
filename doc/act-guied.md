# Superframe Activity开发指南

##入门教程
###Activity是什么？
    Activity是superframe框架中实现单页APP的核心类，它定义了一个情景页与结果页或者另一个情景页发生切换时的生命周期过程，Activity基类以及开发者基于Activity这套机制来实现整个过程的交互逻辑和业务逻辑的处理。
###如何使用Activity创建单页APP

####创建activity文件

activity文件必须使用AMD方式。
文件基本格式如下
    ```
    define(function() {
        //activity代码
    })
    ```

####创建activity实例

框架已提供了activity的基类，基类中统一处理了交互和日志等统一逻辑，开发者不需要再关心交互相关的代码。使用方法如下：
    ```
    define(function() {
        //基类实例化
        var Activity = require('sf/activity');
        var activity = new Activity();

        //返回实例化对象
        return activity;
    });
    ```

####activity生命周期注入

activity实例为开发者提供了在activity各个生命周期的注入接口，在不同的生命周期，可以进行不同的逻辑处理，以下是一个示范
    ```
    /**
      * activity创建注入示例
      */
    //注入函数
    function onCreate(scope, view) {
        //传递部分初始化参数给view
        view.set({
            sfname: 'activity/test/demo',
            srcid: scope.to.params.state.srcid,             // 从aladdin模版传递模版资源号
            order: scope.to.params.state.order,             // 从aladdin模版传递模版序号
            animateType: 'bottom',
            customClassName: 'sf-act-demo-main1',
            headTitle: '<b>我是场景' + scope.to.params.state.order + '</b>'         // 支持传递html
        });
    }
    //调用注入接口
    activity.on("create", onCreate);

    //start阶段，也可以采用同种方式
    function onStart(scope, view) {
        //部分业务逻辑代码
        view.$sfBody.on('click', '.c-container', function() {
            B.activity.pushState({
                activity: 'activity/test/demo1',
                state: {
                    title: $(this).text(),
                    srcid: scope.to.params.state.srcid,
                    order: scope.to.params.state.order + 1
                }
            });
        });
        //为view设置页面内容
        view.set({
            bodyHtml: inlineDemoHtml(50, view)             // 生成demo内容
        });
        //调用view的update方法，更新页面（activity页面渲染）
        view.update();
    }

    //此外，你也可以直接使用匿名函数注入
    activity.on("stop", function(scope, view) {

    });
    activity.on("destroy", function(scope, view) {
        view.set({
            holdView : false
        });
    });

    ```

到此时，整个activity已经基本成型，开发者可根据activity和view两个实例提供的api来进行业务逻辑的组织和编写

####activity注册
    * 注册对应的activity：注册文件位置：esl_config.js
    ```
    B.amd.addPaths({key:__getAmdUri(codPath)})
    //说明：key：对应的activity的amd组件名称
    //value： __getAmdUri(): 需要写对应的文件路径,相对于src下面的路径，具体参照下面的demo；
    B.amd.addPaths（{'activity/iframe/mib-iframe': __getAmdUri("/static/js/activity/iframe/mib-iframe.js")}）
    ```

####activity调起/切换
    * 调起：通过通过B.activity.pushState(option)
    ```
    B.activity.pushState(option)    push State到Hash并触发模块接口
            option      object
                activity    String      必选，为activity名称，参考activity AMD 定义规范；值为base时，会触发回到根场景
                state       any object  可选,模块需要传递的状态，可以为任意对象。因为会encode置入URL中，所以该state尽量简约
                silent      boolean     不推荐使用，仅限于详细了解了Activity周期流程且需要兼容现有代码时使用。
                                        静默方式pushHash，不触发模块接口，但会检测自然检索结果
    ```
####activity预览

##API&规范参考

* 文件路径：src/static/activity/activitname(具体逻辑分目录)/xxxx.js
* 如果对应的阿拉丁需要调起对应的activity，则需要在阿拉丁模板里面注册activity：B.amd.addPaths({key:_getAmdUri(path)})
* 调起，通过B.activity.pushState(option）

### 结果页开发activity规范

* 文件路径：src/static/js/activity
具体API请参考文档(http://sfe.baidu.com/#/superframe/activity使用API规范)

##支持
