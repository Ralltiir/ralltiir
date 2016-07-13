# 调起Superframe

Superframe的调起分为url配置调起和js调起。框架中调起直接使用action模块。

## url配置调起

url配置调起会极大简化开发者在框架中调起Superframe的使用。具体配置如下：

```

<a href="landing page url" data-sf-href="/sf[otherpath]?params">

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
