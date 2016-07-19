# Router API 说明

## Router.config( options )

### 类型

`Function`

### 说明

设置路由配置信息

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| options | Object | 可配置参数<br> options.path 默认路径;<br>options.root 根路径;<br>options.mode 路由模式（可选 async、page，默认为 async);|{ path:string, root: string, mode:async }|

### 返回值

`null`

## Router.add( path, fn, thisArg )

### 类型

`Function`

### 说明

添加路由规则

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| path | String/RegExp= | 路径 | “/graph”|
| fn | Function | 路由处理函数 | action.run|
| thisArg | Object | thisArg 路由处理函数的this指针 | |

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
| options | Object | 当前 controller执行时需要的参数，是以 {k: v} 结构存储的Object ||

### 返回值

`null`

## Router.redirect(url, query, options)

### 类型

`Function`

### 说明

路由跳转

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| url | String | URL 路径 | |
| query | String | 查询条件 | |
| options | Object | 跳转参数<br>options.title 跳转后页面的title;<br>options.force 是否强制跳转；<br>options.silent 是否静默跳转（不改变url);||

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
