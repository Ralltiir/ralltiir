/*
 * @activity: superframe activity
 * @author taoqingqian01
 */
define(function () {

    // 基类实例化
    var service = require('../service');
    var viewModelFactory = require('../view/viewModelFactory');
    
    var exports = service.create();
    
    // activity create
    exports.prototype.create = function (current, prev) {
        //展现搜索框
        require(['../../uiamd/bdbox/util'], function(util) {
            util.fullScreen(true);
        });

        // 传递部分初始化参数给view
        view.set({
            animateType: 'right'
        });
        
        var view = viewFactory.create(current.url);

        //view配置注入
        var viewOpt = $.extend({
            headTitle: current.query.title || current.query.word
        }, current.options && current.options.view);

        view.set(viewOpt);
        view.render();
        
        return view.create(current, prev);
    });

    // activity start
    exports.prototype.attach = function (current, prev) {
        var vmf = viewModelFactory.create(current.url, {
            'container' : view.$sfBody,
        });
        
        var dtd = $.Deferred();
        
        var view = viewFactory.get(current.url);
        
        view && view.start(scope);
        
        return vmf.fetch(current.url + '&mod=1', current.path).then(function() {
            vmf.render()
            vmf.start(current, prev);
        });
    });

    // activity stop
    exports.prototype.detach = function (current, prev) {
        var vmf = viewModelFactory.get(prev.url);
        vmf.stop(current, prev);
        
        var view = viewFactory.get(prev.url);

        return view && view.stop(current, prev);
    });

    // activity destroy
    exports.prototype.destroy = function (current, prev) {
        var vmf = viewModelFactory.get(prev.url);
        if(prev.options) {
            prev.options.view = prev.options.view ? prev.options.view : {};
            prev.options.view._hold = prev.options.view._hold > 1 ? prev.options.view._hold : 1;
            //uc的popstate处理，会对页面做cache，android下需要关闭uc的cache策略
            if((/android/i.test(window.navigator.userAgent) && /UCBrowser/i.test(window.navigator.userAgent))) {
                prev.options.view._hold = 2;
            }
        }
        vmf && vmf.destroy(current, prev);
        

        var view = viewFactory.get(prev.url);
        
        if(prev.options) {
            prev.options.view = prev.options.view || {};
            prev.options.view._hold = prev.options.view._hold > 1 ? 
                prev.options.view._hold : 1;
            //uc的popstate处理，会对页面做cache，android下需要关闭uc的cache策略
            if((/android/i.test(window.navigator.userAgent) && /UCBrowser/i.test(window.navigator.userAgent))) {
                prev.options.view._hold = 2;
            }
        }
        return viewFactory.destroy(current, prev);
    });

    //返回实例化对象
    return activity;
});
