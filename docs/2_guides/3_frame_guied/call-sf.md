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
