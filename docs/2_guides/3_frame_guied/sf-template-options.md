# 模板展现控制

添加 top 参数用于控制模板展现，标准 json 格式。

```
top = {
	"sfhs" : 2	// 头部样式定制
}

```
### 使用方法

通过 url 调起参数进行配置，在调起的 url 参数中添加 json 格式 top 参数。调起方式参考[调起 superframe](http://superframe.baidu.com/#./docs/2_guides/3_frame_guied/call-sf.md)

```
<a href="url" data-sf-href="/sf?top={"sfhs":2}"
```

## header 展现控制

### 常规样式

针对常规的颜色定制，添加 sfhs 参数。

sfhs: 

- sfhs = 0 蓝色（默认）
- sfhs = 1 隐藏头部
- sfhs = 2 灰色
- sfhs = 3 黑色
- sfhs = 4 白色


UE规范：头部常规颜色

```
蓝色 #0099FF 文字颜色：#FFFFFF

灰色 #333333 文字颜色：#FFFFFF

黑色 #000000 文字颜色：#FFFFFF

白色 #FFFFFF 文字颜色：#333333
```

### 特殊样式

其他特殊样式定制需要申请。

