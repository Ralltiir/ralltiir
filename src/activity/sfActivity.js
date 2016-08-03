/*
 * @activity: superframe activity
 * @author taoqingqian01
 */
define(function () {

    // 基类实例化
    var Activity = require('./activity');
    var viewModelFactory = require('../view/viewModelFactory');
    
    var activity = new Activity();
    
    // activity create
    activity.on('create', function (scope, view) {
        //展现搜索框
        require(['../../uiamd/bdbox/util'], function(util) {
            util.fullScreen(true);
        });

        // 传递部分初始化参数给view
        view.set({
            animateType: 'right'
        });
    });

    // activity start
    activity.on('start', function (scope, view) {
				console.log('start');
        var vmf = viewModelFactory.create(scope.to.url, {
            'container' : view.$sfBody,
        });
        
        return vmf.fetch(scope.to.url + '&mod=1', scope.to.path).then(function() {
            vmf.render()
            vmf.start(scope);
        });
    });

    // activity stop
    activity.on('stop', function (scope, view) {
				console.log('stop');
        var vmf = viewModelFactory.get(scope.from.url);
        vmf.stop(scope);
    });

    // activity destroy
    activity.on('destroy', function (scope, view) {
				console.log('destroy');
        //容器为/sf时，执行destroy方法
        /*
        if(window.view) {
            window.view.trigger('destroy');
        }
        */
        var vmf = viewModelFactory.get(scope.from.url);
        if(scope.from.options) {
            scope.from.options.view = scope.from.options.view ? scope.from.options.view : {};
            scope.from.options.view._hold = scope.from.options.view._hold > 1 ? scope.from.options.view._hold : 1;
            //uc的popstate处理，会对页面做cache，android下需要关闭uc的cache策略
            if((/android/i.test(window.navigator.userAgent) && /UCBrowser/i.test(window.navigator.userAgent))) {
                scope.from.options.view._hold = 2;
            }
        }
        vmf && vmf.destroy(scope);
    });

    //返回实例化对象
    return activity;
});
