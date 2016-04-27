/*
 * superframe activity 基类
 * 提供基本交互和日志功能
 * create by taoqingqian01
 * update 2016-03-27 by yangfan: add deferred for user function;
 */

define(function() {

    var View = require('sf/view');

    var Activity = function() {
        var self = this;
        self._scopeList = {
            "create" : function() {},
            "start" : function() {},
            "stop" : function() {},
            "destroy" : function() {}
        };
    };

    /*
     * activity创建时执行，整体框架交互进场
     */
    function _create(state, scope) {
        var self = this;
        var dtd = $.Deferred();
        var scope = scope.routeScope;

        // 创建superfrmae view实例
        self._view = new View();
        
        // 支持用户在create中返回defer
        $.when(_proxy(self._scopeList["create"], self, [scope, self._view])).then(function() {
            // 渲染框架主体
            self._view.render();
            // view执行交互逻辑，框架入场
            return self._view.create(scope);
        }).always(function() {
            dtd.resolve();
        });

        return dtd.promise();
    }

    /*
     * 上一个activity销毁后执行，必要的逻辑处理
     */
    function _start(state, scope) {
        var self = this;
        var dtd = $.Deferred();
        var scope = scope.routeScope;
        
        // 支持用户在start中返回defer
        $.when(_proxy(self._scopeList["start"], self, [scope, self._view])).then(function() {
            return self._view.start(scope);
        }).always(function() {
            dtd.resolve();
        });

        return dtd.promise();
    }

    /*
     * activity被切换时首先执行
     */
    function _stop(state, scope) {
        var self = this;
        var dtd = $.Deferred();
        var scope = scope.routeScope;

        // 支持用户在stop中返回defer
        $.when(_proxy(self._scopeList["stop"], self, [scope, self._view])).then(function() {
            return self._view.stop(scope);
        }).always(function() {
            dtd.resolve();
        });

        return dtd.promise();
    }

    /*
     * activity销毁时执行，整体框架交互退场
     */
    function _destroy(state, scope) {
        var self = this;
        var dtd = $.Deferred();
        var scope = scope.routeScope;

        // 支持用户在destroy中返回defer
        $.when(_proxy(self._scopeList["destroy"], self, [scope, self._view])).then(function() {
            // view退场，并销毁
            return self._view.destroy(scope);
        }).always(function() {
            // 为无需holdView的Activity注销_view实例
            if (!self._view.options.holdView) {
                self._view = null;
            }
            dtd.resolve();
        });

        return dtd.promise();
    }

    function _proxy(fn, context, args) {
        return fn.apply(context, args);
    }

    /*
     * activity生命周期注入机制
     */
    function on(name, callbacks) {
        var self = this;
        self._scopeList[name] = callbacks;
    }

    Activity.prototype = {
        constructor : Activity, 
        on : on,
        create : _create,
        start : _start,
        stop : _stop,
        destroy : _destroy,
        change : function() {},
        resume : function() {}
    };

    return Activity;

});
