define(function() {
        
    var basePageY;  // 记录结果页与activity切换时滚动条位置

    var exports = {};

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

        /*
        if(scope.last.path === scope.path) {
            lastActivity = _activityParser(lastState);
        }
        */

        return excute(currentActivity, prevActivity, current, prev);
    }
    
    /**
     *  controller析构，不同controller切换时，需要执行此析构
     *  注意：析构的一定是scope中的last
     * */
    exports.destroy = function(current, prev) {
        var activity = _activityParser(prev) || null;
        excute(null, activity, current, prev, true);
    }
    
    /**
     *  activity解析
     *  @params router state[object]
     *  @return {"name":"acvitityName","state":"avtivityState"}
     * */
    function _activityParser(state) {
        var prefix = 'sf/activity';
        var suffix = 'Activity';
        var result = {};
        if(state && state.path === '/sf') {
            result["name"] = prefix + state.path + suffix;
            result["state"] = state;
            return result;
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


    /*
     *  按照约定的生命周期，执行activity
     *  @params activty[,lastActivity]
     *  @return null
     *  TODO：当前执行方法不太容易阅读理解，后续需要做优化
     * */
    function excute(activity, lastActivity, current, prev, ready) {

        var activitys = [],
            dtd = $.Deferred();

        for(var i in arguments) {
            activitys.push(arguments[i].name);
        }
        if(activitys.length > 0) {
            _routeScope = {
                "from" : prev,
                "to" : current
            };

            require(activitys, function(Activity, LastActivity) {

                // 上一状态或下一状态是base（结果页）时，加上标识
                var activityScope = _routeScope;
                var methodProxy = new MethodProxy();

                if(!LastActivity) {
                    LastActivity = Activity; 
                }

                if(!ready) {
                    activity && methodProxy.push(Activity.create, Activity, activityScope);
                } else {
                    lastActivity && methodProxy.push(LastActivity.stop, LastActivity, activityScope);
                    activity && methodProxy.push(Activity.start, Activity, activityScope);
                    lastActivity && methodProxy.push(LastActivity.destroy, LastActivity, activityScope);
                }
                
                methodProxy.excute(dtd);
            }); 
        }

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
