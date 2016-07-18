# 调起Superframe

Superframe的调起分为url配置调起和js调起。框架中调起直接使用action模块。

## url配置调起

url配置调起会极大简化开发者在框架中调起Superframe的使用。具体配置如下：

```

<a href="landing page url" data-sf-href="/sf[otherpath]?params">

```

在阿拉丁模板中和superframe-card 中分别提供了两个Smarty方法生成调起链接，详情见下面

### 阿拉丁模板中

用 smarty 生成调起链接：
```
{%fe_fn_c_sflink_prefix url="http://m.baidu.com/sf?word=123" class="c-blocka"%}
test
{%fe_fn_c_sflink_suffix%}
```

### Superframe card中

smarty 生成调起链接：
```
{%fe_fn_card_sflink_prefix url="http://m.baidu.com/sf?word={%$tplData.key|escape:url%}&pd=jingdian_comment&actname=act_poi_comments&title=" class='sfc-evaluate-a'%}
test
{%fe_fn_card_sflink_suffix%}
```

## js调起

url配置调起Superframe是一种较为通用但不能完全满足需求的方式，如果开发者有执行js逻辑后再调起的需求，可使用js调起方法：

```
require(['sf/action/action'], function(action) {
    action.redirect("/sf?params");
});
//注意，结果页的sf require key和sf通用情景页不一致
//结果页action：sf/action/action
//通用情景页action：sf/app/sf/action/action
```


## url参数含义说明

* `pd`：[必选]产品线唯一标识，需申请
* `word`：[必选]查询词
* `tn`：主模版(sf-app)版式选择，默认为normal

* `openapi=1`：使用openapi召回
* `dspName`：召回控制（表示在wise上召回）
* `from_sf`：来源（openapi统计和召回用）
* `resource_id`：资源id（openapi召回主资源号）
* `apitn`：需要透传给openapi的tn参数，控制openapi召回

* `actname`：js模块控制召回卡片
* `ext`：前端使用的透传参数，标准json格式

* `lid`：结果页lid（统计用）
* `frsrcid`：结果页来源卡片srcid （统计用）
* `frorder`：结果页来源卡片order （统计用）
* `title`：sf页标题（展现控制，默认使用word）






