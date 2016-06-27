# API说明

## Action功能说明

    主要用于异步单页应用的调度管理。
    action实例生命周期为:before,do,after，并before和after每个阶段，可传入callback参数类

## Action API说明

### Action.regist

#### 类型

    Function

#### 说明

    生成action，并挂载生命周期中的各个方法。
    当route变更时，注册的各个方法会被执行。

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|name|String|||
|option|Object|生命周期中的各个回调方法|{do:function, before: function, after: function, destroy: function, ready: function}|

#### 返回值
    undefined


### Action._create

#### 类型

    Function

#### 说明

    创建一个action，内部方法

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|option|Object|生命周期中的各个回调方法|{do:function, before: function, after: function, destroy: function, ready: function}|


#### 返回值
    包含生命周期各个方法的action对象

### Action.run

#### 类型

    Function

#### 说明

    当前action的执行，会依次执行：
    1. 本次controller的before/do/after
    2. 上一个action的destroy
    3. 本次action的ready方法

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|scope|Object|当次及上次执行的上下文，包含path及执行参数|{last: Object, path: "act", params: "app/myActivity=%7B%22title%22%3A%22init%20page%22%7D"}|


#### 返回值
    promise对象，待生命周期执行完毕后resolve


### Action.remove

#### 类型

    Function

#### 说明

    将某个action从action的队列中移除

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|name|String|需执行删除的controller的名称|'act'|

#### 返回值
    undefined


# Route模块API说明

## Route功能说明
    route模块主要用于管理结果页Hash，提供hash与controller生命周期的交互，基于当前的hash lib再做一层封装，直接面向Superframe框架提供由hash转化后的结构化数据。

    route目前用于Superframe中，后续结果页异步Hash交互，需要统一使用route

## Route API说明

### Route.init

#### 类型

    Function

#### 说明

    require controller模块，获取本模块需要的controller支持

#### 参数

    无


### Route.start

#### 类型

    Function

#### 说明

    唤醒route，监听hash，初始化scope，并且，如果发现当前已经处于某一个状态下(页面的hash已经有值了)的话，按照当前状态(hash)，主动触发相应的controller

#### 参数

    无


### Route.current

#### 类型

    Object

#### 说明

    记录了当前状态下的path与参数

#### 对象属性
|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|path|String|hash中当前path名称，规范上需要与controller name保持一致，例如，activity的controller是actController，则path为act|path: "act"|
|param|Object|  当前controller执行时需要的参数，是以字符串形式存储的Object。例如activity的参数结构为：{key:value}|params: "app/myActivity=%7B%22title%22%3A%22change%20page%22%7D"|

### Route.push

#### 类型

    Function

#### 说明

    变更路由，增加hash

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|path|String|路由，hash的更改值|'act'|
|params|Object|本次更新状态携带的参数(会被带到URL上)|params: "app/myActivity=%7B%22title%22%3A%22change%20page%22%7D"|



### Route.replace

#### 类型
    Function

#### 说明
    暂未实现

#### 参数说明
|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|path|String|路由，hash的更改值|'act'|
|params|Object|本次更新状态携带的参数(会被带到URL上)||




### Route.on

#### 类型
    
    Function

#### 说明

    注册controller到特定的path，达到特定的path条件的时候，会调用controller的生命周期

#### 参数说明
|*名称*|*类型*|*描述*|*例值*|
| ------------- |:-------------:| -----:| -----:|
|path|String|注册的路径|'act'|
|constructor|Object/Function|利用构造函数/对象，产生新的controller|{}|



### Route.remove

#### 类型
    
    Function

#### 说明

    注销controller，移除监听，是上一个方法(Route.on)的逆向过程

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|name|String|controller的名称，注册(on)时的path|'act'|


### Route.back

#### 类型

    Function

#### 说明

    调用history.back，将状态回退，并且将scope的routeState的action变为back状态，以便告诉上一个状态的controller，这是一个回退。

#### 参数说明
    
    无参数




# Activity使用API规范
## Activity功能说明
    
    Activity为情景页基类，情景页的交互、展现、日志等通用接口，统一由Activity进行接管。针对Activity生命周期，对外提供注入功能。
    功能上，Activity提供一个屏幕，用来和用户完成指定交互，当任何Activity应用调起时，会隐藏检索结果页。
    同一个页面内，只存在一个Activity的应用/实例

### Activity.create

#### 类型
    
    Function

#### 说明

    activity的创建，会调用view的渲染及创建，同时进行activity的各个变量的初始化

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|state|String||'act'|
|scope|Object|执行的当前上下文|'act'|


### Activity.start

#### 类型
    
    Function

#### 说明

    activity的“唤醒”，同样会调用view的，建议对进行页面的数据加载以及渲染等操作，这些操作可以通过注入function到start中完成，提供注入接口。
    注意：start状态会在上一个controller或activity的destroy方法后执行。

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|state|String||'act'|
|scope|Object|执行的当前上下文|'act'|


### Activity.stop

#### 类型
    
    Function

#### 说明

    当调起下一个activity时，当前的基类会被替换，此时最先执行基类的stop方法。

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|state|String||'act'|
|scope|Object|执行的当前上下文|'act'|


### Activity.destroy

#### 类型
    
    Function

#### 说明

    销毁方法在上一个基类的create方法之后执行，主要进行整体activity实例析构、dom隐藏/销毁等操作，提供注入接口。

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|state|String||'act'|
|scope|Object|执行的当前上下文|'act'|



### Activity.change

#### 类型
    
    Function

#### 说明

    Activity的变更方法，在单个Activity内部状态变更，或者单个Activity内部进行切换(自己切换到自己)的时候，调用此方法。

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|state|String||'act'|
|scope|Object|执行的当前上下文|'act'|


### Activity.resume

#### 类型
    
    Function

#### 说明

    暂无实现

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|state|String||'act'|
|scope|Object|执行的当前上下文|'act'|



# View使用API规范
## View功能说明
    
    View层作为展示层，由activity负责调用，负责DOM的渲染，事件的绑定等界面的逻辑处理

### View.render

#### 类型
    
    Function

#### 说明

    view的渲染，及参数的绑定(可自行酌情重写逻辑)

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|opts|Object|自定义模板的参数|{customClassName:'', headTitle:'', headTool: '', bodyHtml: ''}|


### View.create

#### 类型
    
    Function

#### 说明
    
    view入场前准备及动画执行（不包含执行完毕后的结束状态）

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|scope|Object|自定义模板的参数|{customClassName:'', headTitle:'', headTool: '', bodyHtml: ''}|


### View.stop

#### 类型
    
    Function

#### 说明
    
    view退场前准备状态，对应activity.stop

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|scope|Object|自定义模板的参数|{status: {action: 'back', type: 'virtual'}}|


### View.destroy

#### 类型
    
    Function

#### 说明
    
    view退场动画执行及结束，对应activity.destroy

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|scope|Object|自定义模板的参数|{status: {action: 'back', type: 'virtual'}}|



# dataBrige使用API规范
## dataBrige功能说明
    
    用来作为结果页各个Activity直接数据传递，有些时候，我们在activity切换的时候，需要传递大量的数据，但是这些数据记录在url上并不合适。
    所以我们可以使用dataBrige来进行数据的传递。

### dataBridge.set

#### 类型
    
    Function

#### 说明

    存入数据

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|key|String|对应的activity的name路径|'detail'|
|value|\*|希望传递给activity的数据|\*|

### dataBridge.get

#### 类型
    
    Function

#### 说明

    获取某个activity需要的数据

#### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|key|String|对应的activity的name路径|'detail'|

#### 返回值

    set过的value

