# activity点击日志tclog使用规范

> yangfan16@baidu.com


## 日志说明

用于在superframe中满足交互点击统计需求。

该组件在初始化view层时自动加载并在#super-frame父容器上绑定事件代理，无需使用方引入。

注意：该日志为前端JS日志，只能用于交互点击。若a标签点击发生跳转行为，不能使用该日志统计，需使用href=/tc?xxxx拼接日志方式。


## 日志API

在需要发送日志的dom元素上增加classname：SF_LOG_BTN，即可为该dom点击绑定click日志发送事件。

会自动采集目标元素href、title值及superframe父容器公共属性，合并后发送。

若需传入自定义日志内容，在dom元素上增加data-click='{"key":"value","key2":"value2"}'即可。

**注意：data-click中的内容必须为标准json字符串格式！！！**否则会导致JSON.parse解析失败。

### 示例
    
    <!--superframe父容器-->
    <div class="sf-view sf-demo-main1" sfname="activity/demo/main1" srcid="10086" order="1" >
        <!--需要发送交互点击的dom-->
        <div class="SF_LOG_BTN" data-click='{"key":"value"}'>hello</div>
    </div>

### 父容器信息

superframe父容器中会判断并获取sfname/srcid/order属性值。这些内容需要在创建view的时候传入。
    
### JS主动发送统计参数方法

在某些场景中，可能需要在js中主动发送日志，由于需要merge superframe父层容器信息，该接口暴露在view中。

使用方法：
    
    // require sfview
    var SFView = require('sf/sfview');
    // 实例化
    var mySFView = new SFView({
        sfname: 'activity/demo/main1',      // superframe key名，可选
        srcid: '10086',                     // 调起superframe的aladdin资源srcid，可选
        order: '1',                         // 调起superframe的aladdin资源结果位置，可选
        animateType: 'bottom',
        duration: 1000
    });
    // 发送日志api
    mySFView.sendtcLog({
        key1: 'value1',
        key2: 'value2'
    });

有关view请参考：[视图(view)层API说明](/superframe/view_api.md)


## 日志规范

结果页统一使用ct:29,cst:1标识交互点击日志，具体的日志信息以json字符串形式放在clk_info中。

clk_info中规定了一些保留值(module/url/title/srcid/order/sfname)，业务使用方请勿覆盖这些key。

    // 日志发送格式（使用方不用关注）
    B.log.send({
        ct: 29,
        cst: 1,
        clk_info: encodeURIComponent('JSON字符串')
    });
    
    // clk_info必须为标准json格式！
    clk_info = {
        "module": "sf",                         // 标识产品线(必须),枚举值 www-主模版模块;ala-阿拉丁模块;sf-superframe模块
        "url": "http://m.baidu.com",            // 点击href(可选),读取dom中href属性
        "title": "手机百度",                    // 点击内容title(可选),读取dom中title属性
        "srcid": 12345,                         // 资源号(sf中可选)
        "order": 2,                             // 结果顺序(sf中可选)
        "sfname": "activity/news_feed/feed",    // superframe key名(sf中必选)
        "xxxkey": "xxxvalue"                    // 自定义日志内容,会和以上公共字段merge,注意避让
    };
    
    // 实际发送日志示例
    // B.log.send默认日志，会默认包含lid、query等公共信息
    tcreq4log:1
    ssid:0
    from:0
    bd_page_type:1
    uid:0
    pu:usm@2,sz@1320_2001,ta@iphone_1_8.0_3_600
    baiduid:AB23127FB9B46208828AD910FE178CFD
    ref:www_iphone
    lid:1160605716842134659
    w:0_10_12306                // pn_rn_query
    r:1451552907287
    clk_info:%7B%22module%22%3A%22sf%22%2C%22url%22%3A%22http%3A%2F%2Fm.baidu.com%22%2C%22title%22%3A%22%E6%89%8B%E6%9C%BA%E7%99%BE%E5%BA%A6%22%2C%22srcid%22%3A12345%2C%22order%22%3A2%2C%22sfname%22%3A%22activity%2Fnews_feed%2Ffeed%22%2C%22xxxkey%22%3A%22xxxvalue%22%7D   //clk_info中的内容会进行stringify及encodeURIComponent