/*
 * superframe activity 基类
 * 提供基本交互和日志功能
 * create by taoqingqian01
 * update 2016-03-27 by yangfan: add deferred for user function;
 */

define(function() {

    var Activity = function() {
        var self = this;
        self._scopeList = {
            "create" : function() {},
            "start" : function() {},
            "stop" : function() {},
            "destroy" : function() {}
        };
    };
    
    var viewFactory = require('../view/viewFactory');

    /**
     *  make hash
     * */
    function _hashCode(str) {
        try {
            var hash = 0, i, chr, len;
            if (str.length === 0) return hash;
            for (i = 0, len = str.length; i < len; i++) {
                chr   = str.charCodeAt(i);
                hash  = (hash * 31) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return Math.abs(hash);
        } catch(e) {
            return;
        }
    }

    /*
     * activity创建时执行，整体框架交互进场
     */
    function _create(scope) {
        var self = this;
        var dtd = $.Deferred();

        var view = viewFactory.create(scope.to.url);

        //view配置注入
        var viewOpt = $.extend({
            headTitle: scope.to.query.title || scope.to.query.word
        }, scope.to.options && scope.to.options.view);

        view.set(viewOpt);
        
        $.when(_proxy(self._scopeList["create"], self, [scope, view])).then(function() {
            view.render();
            return view.create(scope);
        }).always(function() {
            dtd.resolve();
        });

        // viewFactory.create创建view 实例

        return dtd.promise();
    }

    /*
     * 上一个activity销毁后执行，必要的逻辑处理
     */
    function _start(scope) {
        var self = this;
        var dtd = $.Deferred();
        
        var view = viewFactory.get(scope.to.url);
        
        $.when((function() {
            return view && view.start(scope);
        })()).then(function() {
            return _proxy(self._scopeList["start"], self, [scope, view]);
        }).always(function() {
            dtd.resolve();
        });
        
        // viewFactory.get获取view 实例

        return dtd.promise();
    }

    /*
     * activity被切换时首先执行
     */
    function _stop(scope) {
        var self = this;
        var dtd = $.Deferred();
        
        var view = viewFactory.get(scope.from.url);

        $.when(_proxy(self._scopeList["stop"], self, [scope, view])).then(function() {
            return view && view.stop(scope);
        }).always(function() {
            dtd.resolve();
        });
        
        // viewFactory.stop 暂停view实例

        return dtd.promise();
    }

    /*
     * activity销毁时执行，整体框架交互退场
     */
    function _destroy(scope) {
        var self = this;
        var dtd = $.Deferred();

        var view = viewFactory.get(scope.from.url);
        
        $.when(_proxy(self._scopeList["destroy"], self, [scope, view])).then(function() {
            if(scope.from.options) {
                scope.from.options.view = scope.from.options.view || {};
                scope.from.options.view._hold = scope.from.options.view._hold > 1 ? 
                    scope.from.options.view._hold : 1;
                //uc的popstate处理，会对页面做cache，android下需要关闭uc的cache策略
                if((/android/i.test(window.navigator.userAgent) && /UCBrowser/i.test(window.navigator.userAgent))) {
                    scope.from.options.view._hold = 2;
                }
            }
            return viewFactory.destroy(scope);
        }).always(function() {
            dtd.resolve();
        });
        
        // viewFactory.destroy 销毁view实例

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
