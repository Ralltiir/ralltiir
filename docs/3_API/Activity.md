# Activity API 说明

## Activity.on(name, callbacks)

### 类型
    
`Function`

### 说明
activity 生命周期注入。例如：

```js
activity.on('create', function (scope, view) {
	// 进行 View 相关操作
});
```

### 参数

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|name|String|函数名称|'create'|
|callback|Function|callback 函数| myFunction |




## Activity.create(scope)

### 类型
    
`Function`

### 说明
activity的创建，整体框架交互进场。

### 参数

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|scope|Object|执行的当前上下文|'act'|


## Activity.start

### 类型

`Function`

### 说明

start状态在上一个activity销毁后，进行必要的逻辑处理。

### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|scope|Object|执行的当前上下文|'act'|


## Activity.stop

### 类型

`Function`

### 说明

当调起下一个activity时，当前的基类会被替换，此时最先执行基类的stop方法。

### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|scope|Object|执行的当前上下文|'act'|


## Activity.destroy

### 类型

`Function`

### 说明

销毁方法在上一个基类的create方法之后执行，主要进行整体activity实例析构、dom隐藏/销毁等操作。

### 参数说明

|名称|类型|描述|例值|
| ------------- |:-------------:| -----:| -----:|
|scope|Object|执行的当前上下文|'act'|


