# Superframe阿拉丁应用服务规范

## 服务path与接口

### path
产品线需要提供Superframe页面url切换时的path定义，例如：结果页调起知道Superframe页面，则会异步将页面url从m.baidu.com/s切换为m.baidu.com/zhidao
而m.baidu.com/zhidao则是服务需要提供的。
### 接口
产品线需要提供Superframe页面切换时的访问接口，以及接口规则，便于框架集成接口的fetch方法。

## 返回数据格式

数据接口返回的MIME统一为：text/html

返回的数据格式有以下要求：

1. 每个文本块都使用以下标签定义方法包装：
    <template id="moduleId"></template>
2. mouduleId有白名单，目前提供的moduleId有：
    ```
    <template id="sf_async_head_js">
        {%* 头部js 直接输出不带script标签的js代码 *%}
    </template>

    <template id="sf_async_body">
        {%* 正文部分，输出DOM，不包含JS *%}
    </template>

    <template id="sf_async_merge_js">
        {%* 全局变量 直接输出不带script标签的js代码 *%}
    </template>

    <template id="sf_async_foot_js">
        {%* 底部js 直接输出不带script标签的js代码 *%}
    </template>
    ```

## 页面JS规范

由于页面的JS代码是框架从服务提供的接口中提取的，所以框架在执行JS时，使用的是new Function方法，对于页面内部来说，所有代码都是在Superframe的沙盒执行的，在沙盒中，页面能全局使用的变量仅有global。如有其他需要全局使用的js变量，可以通过global.sandbox(object)来传递。对应的，JS书写有以下几个规则需要遵循：

### 代码书写规范

>JS变量不允许直接绑定在window上，使用的全局命名空间为global；
    
>JS代码中不允许直接重写原生JS对象（包括：Array、String、Date、Number、Functions、Math、RegExp、Boolean、Events）的prototype方法；

### 模块化使用规范

目前许多产品线已经在使用AMD/CMD的模块化管理，所以在使用中也需要明确模块化的name/id命名规范

#### esl方案

无论同步还是异步require，产品线require id都需要改造为require(['产品线id/xxx'])的形式，例如：

    搜索使用require: require(['search/ui','search/sf'])

##### 同步require

同步require保证id符合规范即可

##### 异步require

由于大搜环境使用的是esl amd方案，所以如果同样使用的

#### 非esl方案

##### require&define

目前Superframe容器统一使用的是esl的方案，如果使用了require但不是esl的（例如fisp），则通过如下方式解决：

产品线将之前全局的(window)require&define方案传入global.sandbox中，Superframe容器会将sandbox中的对象再次传入沙盒，对于沙盒中的代码，依然可以安全的使用自身的require和define。

##### 异步加载脚本/资源

如果产品线还在使用

    <script src="url"></script>
    
加载脚本的方式，则需要将对应js文件改为支持esl的形式：

    <script>require(['url'])</script>

## 页面CSS规范

### 命名规范
CSS命名统一使用产品线缩写(产品线标识)- 开头

### 选择器
一般情况下，使用class作为选择器

## 页面生命周期

框架本身会提供global.view对象，来给产品线绑定对应view的生命周期

页面本身必须提供destroy/dispose的方法，并使用以下代码来进行页面析构

    global.view.on('destroy', function() {})

