# JS模块开发教程

## 背景

由于线上已有一部分情景页采用旧的activity方式开发，由js异步请求数据并进行前端渲染。

为了兼容这一部分情景页，提供actCard开发的兼容方式。

## 控制召回

一个actCard模式的sf请求url的例子：

```
/sf?word=北京&mod=0&tn=normal&pd=test&actname=act_poi_travel&title=刘德华&ext=%7B"resource_id"%3A13060%7D
```

其中：

pd参数用于区分垂类以及控制主模版召回；

actname参数用于控制卡片模版召回；

ext参数用于传递一些模版必要的信息，请使用json格式并做urlencode。


#### 选择主模版

actCard模版需要一个独立的app主模版来展现，tplName=actpage。

该主模版通过sf请求url中的pd参数控制，需要申请新的pd参数值并配置该值对应主模版为actpage。

配置文件：/home/work/odp/conf/app/search/sf_all.conf

```
[ITEM_TEMPLATE]
    [.pdvalue]							# pd值
        [..@GROUP]
            template_name:actpage 		# 主模版名
```

如需上线，需联系 陈竣虹(chenjunhong@baidu.com)


#### 召回actCard模版

通过sf请求url中的actname参数值控制召回卡片模版，卡片模版与普通模版一样在sf/card模块中维护。

必须存在actname对应的卡片模版名，否则会显示无结果页。


## 卡片模版开发

#### 流程 

actCard 模块开发、提测、上线也都在开发平台中，开发时选择 card 模块。

具体请参见 http://sfe.baidu.com/#/阿拉丁/圣玛利亚/平台使用手册

注意：目前平台不支持 JS 异步渲染预览，如果预览调试页面，可以点击预览按钮，然后通过 url 强制召回模板调试。

必要配置参数 pd、actname，参考上一节控制召回。下面是一个平台预览 sf 请求 url 召回例子：

```
https://wwwhttps.baidu.com/sf?word=北京&mod=0&tn=normal&pd=jingdian_comment&actname=act_clbus_trav&title=北京_必游景点
```

#### 卡片名

为了与其它普通卡片区分，所有actCard模式的卡片均以act_前缀命名，例如：

act_poi_travel、act_comments


#### 继承模版

actCard模式开发的模版需要继承'base/actcard.tpl'，例如：

```
{%extends "../base/actcard.tpl"%}

{%block name="data_modifier" append%}
	// 数据预处理, 由于基类模版已有预处理操作, 因此需要采用append方式复写
{%/block%}

{%block name="main_container" prepend%}
    // 可以在main_container之前插入一些内容
    <link rel="stylesheet" type="text/css" href="./travel.css?__inline">
{%/block%}

{%block name="act_content"%}
    // 也可以在act_content中插入一些dom
    <div>sth...</div>
{%/block%}

{%block name="act_script"%}
    // 用于插入js
    <link rel="import" href="./travel.js?__inline">
{%/block%}
```

#### css/js规范

css及js编写规范与普通卡片完全相同。

由于旧activity迁移过来的js代码较多，建议采用fis inline js文件的方式，而不要全部写在result.tpl模版中。

etpl及全局方法的使用请参考[app-js开发规范](http://sfe.baidu.com/#/superframe/app/2、js+开发规范)。
