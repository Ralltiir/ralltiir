# activity行为日志webb使用规范

>yangfan16@baidu.com


##日志说明

用于在superframe中满足webb用户行为采集日志统计需求。

该组件在初始化view时自动加载，采集媒体时长、心跳日志等交互行为必要日志，并在view的start和destroy方法中统一打点，采集superframe展现和关闭信息。


##日志发送API

一般webb日志无需使用方主动采集。为了应对业务需求，在view中提供sendWebbLog方法。该方法会自动merge view容器信息。

使用方法：
```
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
    mySFView.sendWebbLog({
        key1: 'value1',
        key2: 'value2'
    });
```


##日志规范

请注意自定义日志内容需要尽量简短。

页面公共信息（query、qid等）及采集时间戳由webb日志统一插入，业务方无需关注。

###日志样例

```
    {
        'type': 'wp_sf',        // superframe webb日志标识
        'action': 'show',       // action标识，superfame中可用的为 show-展现 close-关闭 other-其它（所有使用方主动采集的webb日志action均为other）
        'ext': {                // 具体采集的日志信息，view公共信息及用户主动发送的信息都在该字段下
            'sfname': 'activity/news_feed/feed',    // superframe key名(sf中必选)
            'srcid': 12345,                         // 资源号(sf中可选)
            'order': 2,                             // 结果顺序(sf中可选)
            'xxxkey': 'xxxvalue',                   // 使用方自定义日志内容,会和以上公共字段merge,注意避让
            'yyykey': 'yyyvalue'
        }
    }
```


###实际日志发送内容示例

```
    type:0
    fm:view
    data:[{"type":"wp_sf","action":"other","ext":{"sfname":"activity/news_feed/feed","down":1},"t":1450437977839},{"type":"wp_sf","action":"other","ext":{"sfname":"activity/news_feed/feed","down":2},"t":1450437978105},{"type":"wp_sf","action":"close","ext":{"sfname":"activity/news_feed/feed"},"t":1450437978222}]
    q:何润东公布恋情
    qid:11471577265916961479
    did:a1f5eeaf2bdd89aea69bc05f640285dd
    t:1450437982418
```
webb日志会自动合并多条数据采集内容并在合适的时机统一发送，减少请求数。

每次调用webb日志采集的时间戳会自动记录。