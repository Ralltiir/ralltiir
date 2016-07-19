# Action API 说明

## Action.regist(name, option)

### 类型

`Function`

### 说明

action 注册，只有注册过的action，才会执行。

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| name | String | 稍微长一点的文本 | "/graph"|
| option | Object | 生命周期中的各个回调方法 |{do:function, before: function, after: function, destroy: function, ready: function}|

### 返回值

`null`

## Action.run(current, prev)

### 类型

`Function`

### 说明

执行 Action，如果是同一个action，则不需要执行last action的destroy方法。

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| current | Object | 当前执行上下文 | |
| prev | Object | 上次执行上下文 | |

### 返回值

`null`

## Action.remove

### 类型

`Function`

### 说明

已注册的action注销

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| name | String | 当前状态 |"/graph" |

### 返回值

`null`

## Action.redirect

类型

`Function`

说明

action 跳转

参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| url | String | 当前状态 |"/graph?params=test" |
| query | String | 当前状态 | |
| options | Object | 当前状态 | |

返回值

`null`

## Action.back

类型

`Function`

说明

action 回退，退场交互使用

参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| options | Object | 当前状态 | |

返回值

`null`

## Action.reset

类型

`Function`

说明

action重置，不产生新的 history

参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| url | String | 当前状态 | |
| query | String | 当前状态 | |
| options | Object | 当前状态 | |

返回值

`null`

## Action.start
### 类型

`Function`

### 说明

action开始，进行一些事件初始化工作

### 参数

无

### 返回值

`null`

## Action.config
### 类型

`Function`

### 说明

action 参数配置。

### 参数

| 名称 | 类型 | 描述 | 例值 |
| ------| ------ | ------ |-----|
| options | Object | 参数配置，配置生命周期中的各个回调方法 |{do:function, before: function, after: function, destroy: function, ready: function} |

### 返回值

`null`