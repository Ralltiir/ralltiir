# Route模块API说明
> by shenzhou,taoqingqian01

##Route功能说明

route模块主要用于管理结果页Hash，基于当前的hash lib再做一层封装，直接面向Superframe框架提供由hash转化后的结构化数据。

route目前用于Superframe中，后续结果页异步Hash交互，需要统一使用route

##Route API说明

###Route.current
####类型
`object`
####object说明
名称 | 类型 | 描述
-----|------|-----
path | string | hash中当前path名称，规范上需要与controller name保持一致，例如，activity的controller是actController，则path为act
params | object or string | 当前controller执行时需要的参数，例如activity的参数结构为：`{key:value}`
scope | object | route存储当前route的状态，{name,id...}

###Route.push
####类型
`function`
####参数说明
名称 | 类型 | 描述
-----|------|-----
path[必须] | string | hash中当前path名称，规范上需要与controller name保持一致，例如，activity的controller是actController，则path为act
params[可选] | json or string | 当前controller执行时需要的参数，例如activity的参数结构为：`{activity:"",state:value}`

###Route.replace
####类型
`function`
####参数说明
名称 | 类型 | 描述
-----|------|-----
path[必须] | string | hash中当前path名称，规范上需要与controller name保持一致，例如，activity的controller是actController，则path为act
params[可选] | json or string | 当前controller执行时需要的参数，例如activity的参数结构为：`{activity:"",state:value}`

###Route.on
用于注册controller，只有注册以后，controller才会被执行
####类型
`function`
####参数说明
名称 | 类型 | 描述
-----|------|-----
path[必须] | string | hash中当前path名称，需要与controller name保持一致，例如，activity的controller是actController，则path为act
controller[可选] | function or controller constructor | 如果传入的是function，会把function转化为controller的doAction去执行；也可以直接传入constructor

###Route.remove
用于取消注册controller
####类型
`function`
####参数说明
名称 | 类型 | 描述
-----|------|-----
path[必须] | string | hash中当前path名称，规范上需要与controller name保持一致，例如，activity的controller是actController，则path为act
