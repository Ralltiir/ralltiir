# Superframe 1.0 迁移至 2.0 方案介绍

> qijian, 2016-07-13

## 为什么要迁移

1. 整体情景页渲染不再是前端模板。阿拉丁数据可通过开发Superframe阿拉丁卡片的方式进行展现，极大提升开发者的开发、联调、测试体验；    
2. 情景页有独立于检索结果页的Url。单独访问情景页时，可直接通过Superframe服务直达，无需再经过结果页；    
3. 卡片复用与卡片组合。以往的情景页，更多的是单张卡片的形式，目前Superframe 2.0支持一个情景页里召回多种数据资源（阿拉丁、自然结果等）。通过丰富的卡片数据组合，情景页不再只是结果页的延伸，而是一个可以提供丰富、精准功能的应用。   

另外Superframe2.0 与 Superframe1.0 是不可连通的，及 1.0 的页面是不能调起 2.0 的页面的。所以为保持一致，还请同学们尽快迁移。

## 如何迁移

### 一、迁移至 card （推荐）

迁移至 card 待做的工作

#### 资源相关及odp配置

需要RD介入，文档：http://wiki.baidu.com/pages/viewpage.action?pageId=196172050

接口人：陈竣红

#### 卡片开发

卡片模板开发可参照：[卡片文档](http://superframe.baidu.com/#./docs/2_guides/2_dev_guied/1_dev_card/0.introduce.md)

全局方法和字段：[相关文档](http://superframe.baidu.com/#./docs/2_guides/3_frame_guied/sf_app/2.javascript.md)

superframe 调起相关：[调起文档](http://superframe.baidu.com/#./docs/2_guides/3_frame_guied/call-sf.md)

注意事项：    
1、card 中不可出现 B.xxx，如 B.util.xx。相关方法和字段可参见`全局方法和字段`    
2、pmd组件与结果页的使用方法不同，需要加前缀 sf/app/。如在结果页中使用 pmd/xxx，在card需要改为 sf/app/pmd/xxx

### 二、迁移至JS模块方案 (不推荐）

由于后续视情况可能会下掉此方案，所以迁移请尽量不要使用，否则会导致迁移两次

参考文档：[JS模块开发](http://superframe.baidu.com/#./docs/2_guides/2_dev_guied/3_dev_act/act.md)
