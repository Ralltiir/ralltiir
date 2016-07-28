# 局部更新Superframe视图

目前框架支持简单的视图局部更新机制，通过action接口可直接调用。

## 使用说明

局部更新功能目前仅提供给通用情景页，情景页里通过action模块的update接口提供，具体使用和配置如下：

```
    fif.action.update("/sf?params", null, null,{
        container: $cotainer,    //传入当前视图的container的$对象
        view: view  //传入当前视图对象view
    });

```

>注意：update方法，对url会进行replace变更。同时，使用update，也需要做好同步和异步的切换处理。

## Demo

