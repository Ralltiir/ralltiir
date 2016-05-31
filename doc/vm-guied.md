# ViewModel开发指南

## 入门教程
### ViewModel是什么？
    ViewModel是superframe中的视图数据绑定层。管理superframe的数据和视图。

### ViewModel生命周期

ViewModel的生命周期如下图：

![image](img/sfvm.png)


### ViewModel生命周期的方法

|属于的生命周期|方法名称|类型|描述|
| ------------- |:-------------:|:-------------:|:-------------:|
|init|init|主动执行|初始化VM对象，会自行调用|
|mount|mount|主动执行|模板渲染，会自行调用|
|mount|render|钩子函数|获取渲染模板的方法|
|mount|didmount|钩子函数|模板渲染后的回调方法|
|update|setData|主动执行|触发VM数据更新，及重新渲染|
|update|update|钩子函数|生命周期的update完成后的回调方法|
|destroy|destroy|主动执行|销毁ViewModel组件方法|
|destroy|destroyed|钩子函数|组件销毁后的毁掉方法|


## ViewModel API
### vm.$container

#### 类型
    
    Object

#### 说明
    
    ViewModel的顶层DOM元素，接下来VM的渲染，事件的绑定，等均在此顶层DOM上执行。当传入为string时，默认为顶层DOM的selector，否则认为传入的是顶层DOM的DOM引用。

#### 例
    var vm = new ViewModel({
        $container: '#app'
    });


### vm.data

#### 类型

    Object

#### 说明
    
    ViewModel层数据，是ViewModel层的状态。

#### 例
    
    var vm = new ViewModel({
        $container: '#app',
        data: {
            words: 'hello',
            ext: {
                me: 1
            }
        }
    });

### vm.render

#### 类型

    Function

#### 返回值

    String tpl

#### 说明

    指定VM的渲染TPL，接下来的模板渲染会将render方法中返回的TPL渲染到$container中

#### 例
    
    var vm = new ViewModel({
        $container: '#app',
        data: {
            words: 'hello',
            ext: {
                me: 1
            }
        },
        render: function () {
            return '<div>' + this.data.words + '</div>'    
        }
    });
    
### vm.renderLocal

#### 类型

    Object

#### 返回值

    String tpl //局部更新的TPL

#### 说明

    定义ViewModel的局部更新函数，如果希望ViewModel层在setData重新渲染的时候，只刷新对应的DOM，可以预先设定刷新的方式。

#### 例
    renderLocal: {
        render_data_ext_me: function (data, container) {
            return '<span>' + data.ext.me + '</span>';
        }
    }
    当更改了data.ext.me的值的时候，会刷新带有data-vmbind="data.ext.me"的dom。并用render_data_ext_me的返回值去刷新。



### vm.setData

#### 属于层面

    VM数据层

#### 参数

    {Object} data

#### 类型

    Function

#### 说明

    更新VM的数据（状态），此举会引起重新渲染

#### 例

    document.getElementById('app')
    .addEventListener('click', function () {
        vm.setData({
            words: vm.data.words === 'click' ? 'hello' : 'click'
        });
    });
    

### vm.fetch

#### 属于层面

    VM数据层

#### 类型

    Function

#### 参数

    {Object} opt
    {String} opt.url  //fetch的URL
    {Function} opt.dataProccess  // 返回数据的预处理函数
    {Boolean} opt.noSetData      // 返回数据是否直接设置到vm的Data上，默认为是

#### 说明
    
    请求数据，默认会将请求回的数据，执行一次setData，更新VM的数据。可以设定dataProccess函数，对数据进行预处理。如果在创建VM的时候，传入了这个函数，fetch会在请求回来之后，先执行预处理，然后再用预处理的返回值执行setData。

#### 例

    vm.fetch({
        url: 'http://cq01-cubefe.cq01.baidu.com/~houyu/lab/vuelab/vm.json',
    });


### vm.on

#### 属于层面

    VM事件层

#### 类型
    
    Function

#### 参数
    (DOM事件)
    {String} ekey // 监听事件名称
    {String} selector // 事件绑定的选择器，需要限制在$container中
    {Function} callback //事件监听的回调函数

    或(自定义事件)

    {String} ekey // 监听事件名称
    {Function} callback // 事件监听的回调函数
    {Object} param // 事件监听需要的可选项
        {Boolean} param.listenpre // 是否需要重现之前的fire

#### 说明

    绑定事件，vm内置的事件监听器


### vm.trigger

#### 属于层面
    
    VM的事件层

#### 类型

    Function

#### 参数
    (DOM事件)
    {String} ekey // 触发的事件类型
    {String} selector // 触发的目标的选择器

    或(自定义事件)

    {String} ekey // 触发的事件类型
    {Object} param // 触发自定义事件需要传递的参数




