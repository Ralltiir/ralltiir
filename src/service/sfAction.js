define(function() {
        
    var basePageY;  // 记录结果页与activity切换时滚动条位置

    var exports = {};

    var action = require('./action');

    exports.before = function(current, prev) {
        // 若从结果页切换到activity，此时需要记录结果页滚动条位置
        if (prev.path === "base") {
            basePageY = pageYOffset;
        }
    }

    //执行action逻辑
    exports.do = function(current, prev) {

        var prevActivity,
            currentActivity;
        currentActivity = _activityParser(current);
        prevActivity = _activityParser(prev);

        return excute(currentActivity, prevActivity, current, prev);
    }
    
    /**
     *  controller析构，不同controller切换时，需要执行此析构
     *  注意：析构的一定是scope中的last
     * */
    exports.destroy = function(current, prev) {
        var activity = _activityParser(prev) || null;
        excute(null, activity, current, prev);
    }
    
    /**
     *  activity解析
     *  @params router state[object]
     *  @return {"name":"acvitityName","state":"avtivityState"}
     * */
    function _activityParser(state) {
        var config = action.config();
        
        if((state.path === '/sf' && !state.isBase) || config.fetch && config.fetch.hasOwnProperty(state.path)) {
            return require('../activity/sfActivity');
        } else {
            return false; 
        }

    }
        
    /**
     *  上一状态destroy后，触发ready
     *
     * */
    exports.ready = function(current, prev) {
        var activity = _activityParser(current);
        var lastActivity = _activityParser(prev);
        excute(activity, lastActivity, current, prev, true);
    }

    /**
     *  更新当前action，不进行action切换，只更新视图和数据
     * */
    exports.update = function(current) {
        //需要使用方传入container
        var viewModelFactory = require('../view/viewModelFactory');
        if(current && current.container && current.view) {

            //通过id来标识当前容器，下次替换改容器内容时，先进行前一vm的销毁
            
            var id = current.container.attr('data-container-id');

            if(!id) {
                id = parseInt(Math.random()*(new Date().getTime()));
                current.container.attr('data-container-id', id);
            }

            var vm = viewModelFactory.get(id);
            if(vm) {
                vm.destroy(); 
            } 
            vm = viewModelFactory.create(id, {
                'container' : current.container,
                '_hold' : false //不进行cache
            });
            //容器需要上层视图，来进行生命周期处理
            current.view.one && current.view.one('destroy', function() {
                vm.destroy();
            });
            return vm.fetch(current.url + '&mod=1&p_type=1', current.path).then(function() {vm.render()});
        }

    }


    /*
     *  按照约定的生命周期，执行activity
     *  @params activty[,lastActivity]
     *  @return null
     *  TODO：当前执行方法不太容易阅读理解，后续需要做优化
     * */
    function excute(activity, lastActivity, current, prev, ready) {

        var activitys = [],
            dtd = $.Deferred();

        var _routeScope = {
            "from" : prev,
            "to" : current
        };

        // 上一状态或下一状态是base（结果页）时，加上标识
        var activityScope = _routeScope;
        var methodProxy = new MethodProxy();

        if(!ready) {
            lastActivity && methodProxy.push(lastActivity.stop, lastActivity, activityScope);
            activity && methodProxy.push(activity.create, activity, activityScope);
            lastActivity && methodProxy.push(lastActivity.destroy, lastActivity, activityScope);
        } else {
            activity && methodProxy.push(activity.start, activity, activityScope);
        }
        
        methodProxy.excute(dtd);

        return dtd;

    }
    
    /**
     *  统一给执行的函数加上deferred，链式调用执行
     * */
    function MethodProxy() {
        var list = [],
            deferred;

        function excute(dtd) {
            deferred = $.Deferred();
            deferred.resolve();
            $.each(list, function() {
                var callback = this;
                deferred = deferred.then(function() {
                    return callback();
                });
            });
            list = [];
            return deferred.then(function() {dtd.resolve()});
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

    return exports;

});
