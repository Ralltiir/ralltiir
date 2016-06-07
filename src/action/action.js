define(function() {

    var router = require('../router/router');

    var exports = {};

    var _actions = {};

    var _options = {};

    /**
     *  action 注册，只有注册过的action，才会执行
     *  @params name,option
     *  @return null
     * */
    exports.regist = function(name, option) {
        var action = _create(option);
        _actions[name] = action; 
    }

    /**
     *  创建一个action
     *  @params option
     *  @return action object
     * */
    function _create(option) {
        var _action = {};
        _action.do = option.do || function(){};
        _action.before = option.before || function(){};
        _action.after = option.after || function(){};
        _action.destroy = option.destroy || function(){};
        _action.ready = option.ready || function(){};
        return _action;
    }

    /**
     *  执行action，如果是同一个action，则不需要执行last action的destroy方法
     *  @params name,scope
     *  @return null
     * */
    exports.run = function(current, prev) {
        var proxyList = [];
        
        var name = current.path;

        //处理action src逻辑
        if(_options.src) {
            current.options.src = _options.src;
        }

        var methodProxy = new _MethodProxy();
        if(_actions.hasOwnProperty(name)) {
            var action = _actions[name];
            methodProxy.push(action.before, action, current, prev);
            methodProxy.push(action.do, action, current, prev);
            methodProxy.push(action.after, action, current, prev);
        }
        //执行上一个action的destroy方法
        if(_actions.hasOwnProperty(name) && name !== (prev && prev.path) ) {
            methodProxy.push(_destroy, this, prev.path, current, prev);
        }
        //destroy以后，当前action状态设为ready
        if(_actions.hasOwnProperty(name)) {
            methodProxy.push(action.ready, action, current, prev);
        }

        //清除options.src
        methodProxy.push(function() {
            _options.src = undefined
        });

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
     *  已注册的action注销
     *  @params name
     * */
    exports.remove = function(name) {
        if(_actions.hasOwnProperty(name)) {
            delete _actions[name];
        }
    }

    /**
     *  action析构，在action切换时发生
     *  @params name,scope
     *  @return null
     * */
    function _destroy(name, current, prev) {
        if(_actions.hasOwnProperty(name)) {
            var action = _actions[name];
            action.destroy(current, prev);
        }
    }

    /**
     *  action跳转，用户直接使用
     *  @params url,query,options
     *  @return null
     * */
    exports.redirect = function(url, query, options) {
        router.redirect(url, query, options);
    }

    /**
     *  action回退，退场交互使用
     *  @params url,query,options
     *  @return null
     * */
    exports.back = function(options) {
        _options.src = 'back';
        history.back(); 
    }

    /**
     *  action重置，不产生新的history
     *  @params url,query,options
     *  @return null
     * */
    exports.reset = function(url, query, options) {
        router.reset(url, query, options);
    }

    return exports;
});
