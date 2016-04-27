define(function() {

    var Controller = {};

    var _controllers = {};

    /**
     *  controller 注册，只有注册过的controller，才会执行
     *  @params name,option
     *  @return null
     * */
    Controller.regist = function(name, option) {
        var controller = this.create(option);
        _controllers[name] = controller; 
    }

    /**
     *  创建一个controller
     *  @params option
     *  @return controller object
     * */
    Controller.create = function(option) {
        return _factory(option);
    }

    /**
     *  执行controller，如果是同一个controller，则不需要执行last controller的destroy方法
     *  @params name,scope
     *  @return null
     * */
    Controller.run = function(name, scope, callback) {
        proxyList = [];
        var methodProxy = new _MethodProxy();
        if(_controllers.hasOwnProperty(name)) {
            var controller = _controllers[name];
            methodProxy.push(controller.beforeActivity, controller, scope);
            methodProxy.push(controller.doActivity, controller, scope);
            methodProxy.push(controller.afterActivity, controller, scope);
        }
        //执行上一个controller的destroy方法
        if(_controllers.hasOwnProperty(name) && name !== (scope.last && scope.last.path) ) {
            methodProxy.push(_destroy, this, scope.last.path, scope);
        }
        //destroy以后，当前controller状态设为ready
        if(_controllers.hasOwnProperty(name)) {
            methodProxy.push(controller.ready, controller, scope);
        }
        return methodProxy.excute();
    }

    /**
     *  代理函数执行，同时兼容有deferred和无deferred返回的函数，统一处理加上derferred，保证执行顺序。
     *  push方法：将执行函数push进队列，等待统一执行
     *  excute方法：按顺序执行队列中的方法，使用递归是为了兼容函数可能不返回deferred的情况
     *  @return object{push,excute}
     * */
    function _MethodProxy() {
        var list = [];

        function excute() {
            deferred = $.Deferred();
            deferred.resolve();
            $.each(list, function() {
                var callback = this;
                deferred = deferred.then(function() {
                    return callback();
                });
            });
            list = [];
            return deferred;
        }

        function push(fn, context) {
            var args = (2 in arguments) && (Array.prototype.slice.call(arguments, 2));
            if(typeof fn === 'function') {
                list.push(function() {return fn.apply(context, args ? args : []) });
            }
        }

        return {
            push : push,
            excute : excute
        }
    }

    /**
     *  已注册的controller注销
     *  @params name
     * */
    Controller.remove = function(name) {
        if(_controllers.hasOwnProperty(name)) {
            delete _controllers[name];
        }
    }

    /**
     *  controller析构，在controller切换时发生
     *  @params name,scope
     *  @return null
     * */
    function _destroy(name, scope) {
        if(_controllers.hasOwnProperty(name)) {
            var controller = _controllers[name];
            controller.destroy(scope);
        }
    }
    
    /**
     *  controller工厂函数，对controller进行归一化
     *  @params option
     *  @return null
     * */
    var _factory = function(option) {
        var _controller = {};
        _controller.doActivity = option.doActivity || function(){};
        _controller.beforeActivity = option.beforeActivity || function(){};
        _controller.afterActivity = option.afterActivity || function(){};
        _controller.destroy = option.destroy || function(){};
        _controller.ready = option.ready || function(){};
        return _controller;
    }

    return Controller;
});
