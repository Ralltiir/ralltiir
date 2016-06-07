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
        // 传递部分初始化参数给view
        view.set({
            animateType: 'right'
        });
    });

    // activity start
    activity.on('start', function (scope, view) {
        
        vmf = viewModelFactory.create(scope.to.url, {
            'container' : view.$sfBody,
        });
        
        return vmf.fetch(scope.to.url + '&mod=1').then(function() {vmf.render()});
    });

    // activity stop
    activity.on('stop', function (scope, view) {
    });

    // activity destroy
    activity.on('destroy', function (scope, view) {
        vmf = viewModelFactory.create(scope.from.url);
        vmf && vmf.destroy();
    });

    //返回实例化对象
    return activity;
});
