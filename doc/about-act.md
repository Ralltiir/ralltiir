# 了解Activity
    
Activity是superframe框架中实现单页APP的核心类，它定义了一个情景页与结果页或者另一个情景页发生切换时的生命周期过程，Activity基类以及开发者基于Activity这套机制来实现整个过程的交互逻辑和业务逻辑的处理。

##Activity类

    Activity类为情景页基类，情景页的交互、展现、日志等通用接口，统一由Activity进行接管。针对Activity生命周期，对外提供注入功能。
    功能上，Activity提供一个屏幕，用来和用户完成指定交互，当任何Activity应用调起时，会隐藏检索结果页。
    同一个页面内，只存在一个Activity的应用/实例

###基类说明
    基类定义了Activity的生命周期，在各生命周期之内实现Activity的基础交互功能，同时也提供对应的接口注入。各生命周期描述如下：

####create（创建）

    基类在创建时，会调用View层，实现整体情景页全屏效果的展现。同时，进行Activity的各参数初始化

####start（开始）

    基类在start周期里，建议对进行页面的数据加载以及渲染等操作，这些操作可以通过注入function到start中完成，提供注入接口。
    注意：start状态会在上一个controller或activity的destroy方法后执行。

####stop（停止）

    当调起下一个activity时，当前的基类会被替换，此时最先执行基类的stop方法。

####destroy（销毁）

    销毁方法在上一个基类的create方法之后执行，主要进行整体activity实例析构、dom隐藏/销毁等操作，提供注入接口。

####change（变更）

    change方法主要用于处理相同的activity实例之间的切换。

###Activity应用的生命周期
    
    按时序，Activity组件从初始化到销毁会经历create、start、change、stop、destroy操作改变运行状态
        create  创建组件实例，处理view展现前的初始化工作
        start   页面渲染
        change  根据状态参数改变当前场景
        stop    停止当前场景，一般在此开始对view进行隐藏/屏蔽
        destroy 销毁当前组件

##Activity Controller
```
    Activity组件管理模块，管理Activity生命周期及HASH。

    任何关于Activity的Hash改变均应该调用Activity Controller的API来实现，后者会操作HASH，改变各个Activity的运行状态。
    当用户刷新页面时，Activity Controller也会根据HASH恢复Activity的运行状态。
