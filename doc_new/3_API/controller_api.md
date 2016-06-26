# Controller模块API说明
> by shenzhou,taoqingqian01

##Controller功能说明

Controller模块功能与MVC中的Controller基本一致，主要用于异步单页应用的调度管理，目前Superframe使用此模式，当前只有一个controller:actController，后续结果页其他单页模式需迁移至controller下。

controller本身生命周期为:beforeActivity,doActivity,afterActivity，并before和after每个阶段，可传入callback参数

一般情况下，controller不会直接面向结果页用户，controller自身模块会集成至Route模块中。

##Controller API说明

###Controller.controller
执行对应controller
####类型
`function`
####参数说明
名称 | 类型 | 描述
-----|------|-----
option[必须] | json | {beforeActivity:function,afterActivity:function}
name[必须] | string | controller name，可通过route获取，规范上与route的path保持一致

###Controller.registe(待定)

##Controller 内部执行说明

###执行流程
1. controller方法根据传入的参数，找到对应的controller对象;
2. 执行doActivity之前，会触发beforeActivity回调;
3. 根据传入的参数，找到对应的activity，并在controller的scope中找到lastActivity
4. 执行doActivity;
5. doActivity执行完成之后，会触发afterActivity的钩子。

###doActivity说明
doActivity是controller的核心方法。用于执行controller中注册的各个activity（对于Superframe来说，每个activity就是一个activity，doActivity的作用就是调度各个activity）。

每个controller的doActivity方法需要自己实现，比如actController的doActivity方法的大致逻辑是：传入nowActivity与lastactivity,操作两个activity的生命周期（activity内部需要实现约定的基类方法）

###actController doActivity说明
####执行流程：
1. lastActivity stop
2. nowActivity create
3. lastActivity destory
4. nowActivity start
