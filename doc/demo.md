# Demo演示
## Hello SuperFrame
    让我们现在来做一个简单的hello world的demo吧

### 1. 入口HTML
    我们需要一个入口的HTML来进行superframe的调起与展示。在这个HTML里面，我们来进行依赖模块的加载，与界面的相应，于是我们建立了一个index.html

### 2. 加载依赖库
    SuperFrame是有依赖的，所以我们需要在index.html中加载superframe所需要的依赖
    `
    <!--ESL库可以酌情换成其他框架，如requirejs等-->
    <script src="./static/js/lib/esl.js"></script>
    <!--同样的，zepto也可以替换成jquery-->
    <script src="./static/js/lib/zepto.js"></script>
    <!--HASH_LIB目前必须要引入，后续会解除依赖-->
    <script src="./static/js/lib/hash_lib.js"></script>
    <!--我们的一些配置项,稍后会解释-->
    <script src="./static/js/lib/esl_config.js"></script>
    `

### 3. AMD配置
    在esl_config.js中，有一些写好的方法，但是也需要我们配置，需要我们配置的有这几处：
    1. 静态文件寻找路径，例：
        `
        require
        .config({
            baseUrl: './static/js/',
        });
        `
    2. 配置activity，提前告诉superframe框架，我们准备了哪些activity，在这里我们准备了一个myActivity，作为activity的样例。
        `
        B.amd.addPaths({
            'app/myActivity': 'app/myActivity.js'
        });
        `
### 4. 书写或直接引用我们写好的controller，这里我们来看一下如何写一个最简单的controller：
    
    define(
        ['sf/route', 'sf/controller'],
        function (route, Controller) {
            var STARTED = false;

            var _routeScope = {};
            
            var _routeState = 'natural';
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

    上面的代码可根据自己产品进行改造，制作好了我们自己的controller,我们就可以管理我们的activity了。

### 5. 调用页面整体的controller，可以自行书写，或者使用目前现成的
    在这里，我们使用require进行调起写好的controller，然后唤醒controller。
    `
    <script>
        require(
            ['app/myController'],
            function (controller) {
                controller.start();
            }
        );
    </script>
    `

### 6. 在特定条件下，触发controller的更新状态
    `
    <button id="sview">show view</button>
    <div id="viewArea"></div>
    <script>
        require(
            ['app/myController'],
            function (controller) {
                controller.start();
                $('#sview')
                .on(
                    'click',
                    function () {
                        controller.pushState({
                            activity: 'app/myActivity',
                            state: {
                                title: 'Hello SuperFrame!'
                            }
                        });
                    }
                );
            }
        );
    </script>
    `

### 7. 点击sview按钮，得到效果：
![image](img/hello_superframe.jpg)






