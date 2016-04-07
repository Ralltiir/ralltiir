# 数据通信(dataBrige)模块API
> by shenzhou && taoqingqian01

## 组件说明

用来作为结果页各个Activity直接数据传递

## 生命周期说明

结果页单条结果也可以调用

## 接口API说明

###  B.dataBridge.set接口

```javascript
//key: 对应的activity的name路径
//value：希望传递给activity的数据
 B.dataBridge.set(key,value)
```

###B.dataBridge.get接口

```javascript
//key:key对应数据的key，每个activity获取自己的数据
B.dataBrige.get(key)

```


