# 视图(view)层API说明

> by yangfan16

## sfview组件

sfview组件作为superframe的view层，提供统一的dom结构、展现样式及交互动画。

sfview组件需要在activity实例中使用。


## 使用sfview

sfview组件遵循结果页amd规范开发，使用方式：

```
    // require
    var SFView = require('sf/sfview');
    // 创建实例
    var mySFView = new SFView({
        sfname: 'activity/demo/main1',  // superframe key，规定该key与amd中组件key名相同
        srcid: '10086',                 // 调起superframe的aladdin资源srcid，可选，需要hash传入
        order: '1',                     // 调起superframe的aladdin资源结果位置，可选，需要hash传入
        animateType: 'bottom',          // 入场出场动画类型 right-右侧进入/bottom-底部进入
        duration: 300                   // 动画持续时间 若为0,无动画
    });
```


### sfview参数说明

sfname: [string]标识该情景页的key，该key与amd中组件key名保持相同；

srcid: [string]调起superframe的aladdin资源srcid，可选，一般当情景页的点击需要算在aladdin卡片内时，需要该参数，使用hash或dataBridge传入；

order: [string]调起superframe的aladdin资源结果位置，可选，一般当情景页的点击需要算在aladdin卡片内时，需要该参数，使用hash或dataBridge传入；

animateType: [string(right/bottom)]场景进场/出场动画类型，可选，目前提供right、bottom两种，分别代表右侧进场、下方进场；

duration: [numbaer]动画持续时间，可选，默认值为300ms；


### render方法

渲染view的方法：

```
    // 渲染view
    mySFView.render({
        customClassName: 'sf-demo-main1',       // 自定义样式名,添加在view父容器上
        headTitle: '我是场景一',                // 自定义头部标题,支持传递html
        headTool: '',                           // 自定义头部右侧工具,支持传递html
        bodyHtml: '<div>我是结果内容html</div>' // 自定义结果内容html
    });
```

customClassName: [string]自定义样式名,添加在view父容器上,可以有多个,用空格隔开，可选；

headTitle: [string|html]场景头部标题，支持html，可选，若无则为空；

headTool: [string|html]场景头部右侧工具按钮，支持html，可选，若无则为空；

bodyHtml: [string|html]场景内容html片段，可选，若无则为空；

调用render方法渲染view后会立即在结果页中插入相应dom并绑定必要事件，请在合适的时机render。


### view生成dom结构示例：

```
    <div id="super-frame">
        <div class="sf-view sf-demo-custom-classname" sfname="activity/demo/main1" srcid="10086" order="1">
            <!-- 头部 -->
            <div class="sf-head">
                <div class="sf-back"><i class="c-icon">&#xe783</i></div>
                <div class="sf-tool"></div>
                <div class="sf-title">场景名称</div>
            </div>
            <!-- 内容 -->
            <div class="sf-body">
                <div>结果内容html片段</div>
            </div>
        </div>
        ......
        <div class="sf-view">
        </div>
    </div>
```

其中#super-frame为所有sf场景的父容器，与结果页#page平行，全局唯一。

.sf-view为每个场景的父容器，可以使用如下方法获取sf dom对象。

mySFView.$sfView: 自身场景父容器；

mySFView.$sfHead: 头部父容器；

mySFView.$sfBody: 内容父容器；

注意：对于dom操作请使用如上方法限定范围，例如：mySFView.$sfBody.find('.xxxxxx')。


### sf内classname命名规范

为避免css冲突，sf内的classname遵循以下命名规范：

    .sf-路径名-文件名-xxxx-yyy

例如，若某个sf的key为activity/act_demo/main1，则在该sf中，所有classname必须以sf-act-demo-main1为前缀。


### sfview方法

由于superframe中的情景页存在与其它情景页切换的场景，因此sfview中的交互和activity状态对应，切换顺序如下：

A: stop -> B: create -> A: destroy -> B: start

四种方法描述如下：

    create(opts, env)：
    view入场前准备及动画执行（不包含执行完毕后的结束状态），对应activity.create；
    由于动画涉及延时，必须采用deferred传递状态，即：必须当mySFView.create()完成时结束activity.create，一般的写法：
    // mySFView.create()方法本身返回deferred对象，可以直接作为activity.create的返回对象
    return mySFView.create({useAnimate:true}, env);
    
    start(opts, env)：
    view入场动画执行结束状态，对应activity.start。
    由于start在其它情景destroy之后触发，因此此时整个page中真正成为仅有自身activity的单页；
    可以在此时进行scrollTop等页面全局状态改变操作，view入场动画执行结束状态会将定位由fixed变更为static，因此也在此处执行。
    此处view.start不涉及延时，可根据自身业务自行决定是否使用deferred，一般的使用方法：
    // 注意useAnimate参数必须与create中相同
    return mySFView.start({useAnimate:true}, env);

    stop(opts, env)：
    view退场前准备状态，对应activity.stop；
    sfview在此处没有样式变更，但会判断退场动画是否执行，并执行webb日志发送等操作，一般的使用方法：
    return mySFView.stop({useAnimate:true}, env);

    destroy(opts, env)：
    view退场动画执行及结束，对应activity.destroy；
    destroy虽然执行动画存在延时，但可以不必阻塞其它场景进入，一般的使用方法：
    mySFView.destroy({useAnimate:true}, env);

其中参数opts用于传递控制标识，env用于传递activity环境变量。

opts.useAnimate: [Boolean]可选，标记是否使用动画，若为false，则强制不使用动画。

opts.env：[obj]虽然可选，请保证传递。sfview会根据env中的环境变量判断是否使用场景切换交互动画。

注意：create/start中的动画标记以create中的判断为准；同理，stop/destroy中的动画标记以stop中的为准。

另外，在destroy方法中还提供保留场景控制参数opts.holdView，默认为false。

默认的，destroy方法会注销view的所有dom及事件；但在某些业务中需要反复在多个场景间切换，需要保留某些view的状态，当opts.holdView为true时，destroy方法仅隐藏view但不真正执行销毁。


### sfview中发送tclog统计日志

```
// 发送日志api
mySFView.sendtcLog({
    key1: 'value1',     // 自定义统计参数
    key2: 'value2'      // 自定义统计参数
});
```

详细参见[activity点击日志tclog使用规范](/superframe/activity_tclog.md)


### sfview中拼接站外tc跳转链接

```
mySFView.getJumpLinkUrl({
    src: 'http://www.baidu.com',     // 目标站点url
    nsrc: 'xxxxxxxxxxx',             // 目标站点加密url（与src必须存在一个）
    clk_info: {                      // 自定义统计信息，可选
        key:'value'
    }
});
```

该方法调用B.utils.link.getJumpLinkUrl方法返回tc跳转链接，不合法的key会被自动过滤，自定义统计参数需要放在clk_info中，注意kv对尽量短小。

mySFView.getJumpLinkUrl会自动带上sfname/srcid/order等sfview基础信息，可在render方法中生成html使用。返回的url链接字符串示例如下：

```
http://m.baidu.com/from=0/ssid=0/uid=0/bd_page_type=1/pu=usm%408%2Csz%401320_2001%2Cta%40iphone_1_8.0_3_600/baiduid=6995781947BAEC3B3CA243802A544BBC/w=0_10_%E5%88%98%E8%AF%97%E8%AF%97/t=iphone/l=1/tc?lid=2811881361996217012&ref=www_iphone&src=http%3A%2F%2Fwww.baidu.com&clk_info=%7B%22sfname%22%3A%22act_demo%2Fdemo%2Fmain1%22%2C%22srcid%22%3A%2215319%22%2C%22order%22%3A%225%22%2C%22key%22%3A%22value%22%7D
```



## 在activity中使用sfview

一个完整示例：
```
define(function() {

    // require
    var SFView = require('sf/sfview');
    var mySFView;

    // 生成测试数据的方法
    var inlineDemoHtml = function(index) {
        var demoData = ['superframe','activity','sfview','route','databridge'];
        var outputHTML = '<ul>';
        for (var i = 0; i < index; i++) {
            outputHTML += '<li class="c-container c-line-bottom" src="' + mySFView.getJumpLinkUrl({src:'http://www.baidu.com', clk_info:{key:'value'}}) + '"><b>' + i + ':</b>' + demoData[Math.floor((Math.random()*demoData.length))] + '</li>';
        };
        outputHTML += '</ul>';
        return outputHTML;
    };

    function create(state, env) {
        if (!mySFView) {
            // 实例化sfview
            mySFView = new SFView({
                sfname: 'act_demo/demo/main1',
                srcid: state.srcid,             // 从aladdin模版传递模版资源号
                order: state.order,             // 从aladdin模版传递模版序号
                animateType: 'bottom'
            });
            // 渲染view
            mySFView.render({
                customClassName: 'sf-act-demo-main1',
                headTitle: '<b>我是场景一</b>',          // 支持传递html
                bodyHtml: inlineDemoHtml(50)             // 生成demo内容
            });

            // 为每一条结果绑定下一层sf调起
            mySFView.$sfBody.on('click', '.c-container', function() {
                B.activity.pushState({
                    activity: 'activity/act_demo/main2',
                    state: {
                        title: $(this).text(),
                        srcid: state.srcid,
                        order: state.order
                    }
                });
            });
        };

        var dtd_create = $.Deferred();
        // 动画执行存在延时，采用deferred传递状态
        $.when(mySFView.create({}, env)).always(function(){
            dtd_create.resolve();
        });
        return dtd_create;
    }

    function start(state, env) {
        return mySFView.start({}, env);
    }

    function stop(state, env) {
        return mySFView.stop({}, env);
    }

    function destroy(state, env) {
        // destroy虽然执行动画存在延时，但可以不必阻塞其它场景进入
        // 可根据实际情况选择是否使用deferred
        mySFView.destroy({holdView:false}, env);
        mySFView = null;
    }

    return {
        create: create,
        start: start,
        stop: stop,
        destroy: destroy
    }
});
```