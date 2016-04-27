define(
    ['sf/route', 'sf/controller'],
    function (route, Controller) {
        var STARTED = false;
        
        var _routeScope = {};

        var _routeState = "natural";
        /*
         * @class
         * @desc 实现业务controller
         */
        function MyController() {
            var self = this;
            self.swtichTag = 'act';
        }

        MyController.prototype = {
            constructor: MyController,

            /*
             * @public
             * @desc 框架的初始化及唤醒
             */
            start: function () {
                var self = this;
                if (! (HASH = B.hash) || STARTED === true) {
                    return false;
                }
                // 初始化route
                route.init();
                
                // 监听某一个特定的路由下，改触发的事件
                route.on(self.swtichTag, {
                    'before': self.beforeActivity,
                    'do': self.doActivity,
                    'ready': self.ready,
                    'destroy': self.destroy
                });

                route.on('base', {});

                // 开启路由
                route.start();

                return STARTED = true;
            },

            destroy: function (scope) {
                var activity = scope.last ? _activityParser(scope.last.params) : null;
                _execute(null, activity, false, scope);
            },

            doActivity: function (scope) {
                var lastState = scope.last.params;
                var state = scope.params;
                var lastActivity;
                var activity = _activityParser(state);
                if (scope.last.path === scope.path) {
                    lastActivity = _activityParser(lastState);
                }

                return _execute(activity, lastActivity, false, scope);
            },

            /** 
             * 上一状态destroy后，触发ready
             */
            ready: function (scope) {
                var activity = _activityParser(scope.params);
                _execute(activity, null, true, scope);
            },

            /*
             * @class public
             *
             */
            pushState: function (options) {
                options = options || {};
                var silent = options.silent === true ? true: false;
                var self = this;
                if (!options.activity) {
                    return;
                }
                if (options.activity === 'base') {
                    B.route.push('base');
                }
                else {
                    var state = options.state
                        ? options.activity 
                            + '=' + encodeURIComponent(JSON.stringify(options.state))
                        : options.activity;
                    B.route.push(self.swtichTag, state);
                }
            }
        };

        /*
         * activity的变化引起的执行activity操作。
         * @params activity[, lastActivity, ready, scope]
         * @return null
         */
        function _execute(activity, lastActivity, ready, scope) {
            var activities = [];
            var dtd = $.Deferred();
            var acts = [].slice.call(arguments, 0, 2);
            // 构造activities
            for (var i in acts) {
                if (acts[i] && B.amd.exist(acts[i].name)) {
                     activities.push(acts[i].name);
                }
            }
            if (activities.length > 0) {
                _routeScope = {
                    'from': {
                        path : scope.last ? scope.last.path : null,
                        params : scope.last ? _activityParser(scope.last.params) : null
                    },
                    'to': {
                        path : scope.path,
                        params : _activityParser(scope.params)
                    },
                    'status': scope.routeStatus
                };
                // 获取activities。并且进行切换
                require(
                    activities,
                    function (Activity, LastActivity) {
                        var proxyList = [];
                        var isSame = Activity === LastActivity; //activity相同，则进行内部切换
                        if (!LastActivity) {
                            LastActivity = Activity;
                        }
                        var activityScope = {
                            routeState: _routeState,
                            routeScope: _routeScope
                        };
                        var methodProxy = new MethodProxy();
                        
                        // 上一个activity被销毁之后，会触发本次的ready
                        // 按照声明周期执行
                        if (!ready) {
                            if (isSame) {
                                Activity
                                && methodProxy.push(Activity.change, Activity, activity.state, activityScope);
                            }
                            else {
                                lastActivity
                                && methodProxy.push(LastActivity.stop, LastActivity, lastActivity.state, activityScope);
                                
                                activity
                                && methodProxy.push(Activity.create, Activity, activity.state, activityScope);
                                
                                lastActivity
                                && methodProxy.push(LastActivity.destroy, LastActivity, lastActivity.state, activityScope);

                            }
                        }
                        else {
                            activity
                            && methodProxy.push(Activity.start, Activity,activity.state, activityScope);
                            activity
                            && methodProxy.push(Activity.resume, Activity,activity.state, activityScope);
                        }

                        methodProxy
                        .push(function () {
                            _routeState = "natural";
                            _routeScope = {}; 
                        }, this);

                        methodProxy.excute(dtd);
                    }
                );
            }

            return dtd;
        }

        // activity解析的工具方法
        function _activityParser(paramStr) {
            var reg = /([^=]+)=?(.*)/;
            var matches = paramStr ? paramStr.match(reg) : null;
            if (matches && matches[1]) {
                var result = {};
                result['name'] = matches[1];
                result['state'] = matches[2]
                                ? $.parseJSON(decodeURIComponent(matches[2]))
                                : undefined;
                return result;
            }
            else {
                return false;
            }
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

        // 继承自controller的基类
        MyController.prototype = $.extend({}, Controller.create({}), MyController.prototype);

        return new MyController;
    }
);
