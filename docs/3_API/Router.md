# Router API 说明

## Router.config([options])

### 类型

`Function`

### 说明

设置路由配置信息

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| options | Object | 可配置参数<br> options.path 初始路径，默认为`'/'`;<br>options.index index文件名 默认为`''`;<br>options.mode 路由模式（可选 async、page，默认为 async);|{ path:string, root: string, mode:async }|

### 返回值

`null`

## Router.add( path, fn [,thisArg])

### 类型

`Function`

### 说明

添加路由规则

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| path | String/RegExp | 路由路径，如果是空字符串则认为是设置默认路由。 | "/graph"|
| fn | Function | 路由处理函数;<br>function(string, Object, Object, string, Object){}<br>路由处理函数（函数参数分别是：path、查询条件、路径参数、完整URL、跳转参数<br>跳转参数参考redirect(url, query, options) | action.run|
| thisArg | Object | 路由处理函数的this指针 | this |

### 返回值

`null`
## Router.start(options)
### 类型

`Function`

### 说明

启动路由监控，触发相应的 controller。

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| options | Object | 路由配置，可配置参数参考 Router.config |{ path:string, root: string, mode:async }|

### 返回值
`null`


## Router.remove(path)

### 类型

`Function`

### 说明

删除路由规则

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| path | String | 移除路由的路径名称 | "/graph"|

### 返回值

`null`
## Router.clear()

### 类型

`Function`

### 说明

清除所有路由规则

### 参数

无

### 返回值

`null`

## Router.reset(url, query, options)

### 类型

`Function`

### 说明

重置当前的 URL

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| url | String | 路径 | |
| query | String | 查询条件 | |
| options | Object | 重置参数;<br>options.slient {boolean} 是否静默重置<br>如果静默重置则不会触发相应的路由规则处理|{slient: true}|

### 返回值

`null`

## Router.redirect(url, query [,options])

### 类型

`Function`

### 说明

URL 跳转

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| url | String | URL 路径 | |
| query | Object | 查询条件 | |
| options | Object | 跳转参数<br>options.force 是否强制跳转(默认情况下相同URL不跳转);<br>options.silent 是否静默跳转（静默跳转则不改变当前url);|{force: false, silent: false}|

### 返回值

`null`


## Router.stop()
### 类型

`Function`

### 说明

停止路由监控

### 参数

无

### 返回值

`null`

## Router.controller(implement)
### 类型

`Function`

### 说明

更换控制器，仅用于单元测试及自定义控制器的调试

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| implement | Object | 路由控制器 | MyController|

### 返回值

`null`
