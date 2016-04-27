/**
 *  Route 模块
 *
 */
window.B = window.B || {}; (function(B) {

    var Route = function() {
        var current = {};
        var HASH,
            STARTED = false;

        var SINGLE_PAGE = ["act"];

        var _routeState = 'natural';
        
        var scope = {
            "last" : {
            },
            "path" : "",
            "params" : null,
            "routeStatus" : {
                "action" : "history",
                "type" : "natural"
            }
        };

        var controller;

        /**
         *  变更路由，history+1
         *  @params path,params，存在互斥的controller，所以需要针对互斥做处理
         *  @return true/false
         * */
        function push(path, params) {
            _routeState = "virtual";
            scope.routeStatus = {
                "action" : "push",
                "type" : "virtual"
            };
            
            var controllerName = path;
            if (!controllerName) return;
            if(path == 'base') {
                //会Base页面时，移除单页应用
                for(var i in SINGLE_PAGE) {
                    HASH.remove(SINGLE_PAGE[i]);
                }
                //TODO Base页面切换query操作需要带参数，前提是异步切换到新框架下
            } else {
                HASH.set(path, params);
            }
        }
        
        /**
         *  返回上一次history，主动调用方法时，新增统计
         * */
        function back() {
            _routeState = "virtual";
            scope.routeStatus = {
                "action" : "back",
                "type" : "virtual"
            };
            history.back();
        }

        /**
         *  替换路由，history不变
         *  @params path,params
         *  @return true/false
         * */
        function replace(path, params) {
            //TODO            
        }

        /**
         *  controller注册入口
         *  @params path,controller/function
         *  @return Route
         * */
        function on(path, constructor) {
            var option = {};
            if(typeof constructor === 'function') {
                option.doActivity = constructor;
            }
            if(typeof constructor === 'object') {
                option.doActivity = constructor.do;
                option.beforeActivity = constructor.before;
                option.afterActivity = constructor.after;
                option.destroy = constructor.destroy;
                option.ready = constructor.ready;
            }
            controller.regist(path, option);
        }

        /**
         *  controller注销
         *  @params path
         *  @return Route
         * */
        function remove(name) {
            controller.remove(name); 
        }

        /**
         *  获取hash字符串，做部分特殊处理
         *  @params url
         *  @return hashString or '';
         * */
        function _getHash(url) {
            var match = url.match(/#(.*)$/);
            var hash = match ? match[0] : '';
            if (hash.indexOf('#%7C') === 0) {
                /**
                 *  chrome、微信等浏览器只对|进行encode，所以只替换%7C，这里有值被替换了的风险
                 *  by taoqingqian01
                 * */
                hash = hash.replace(/%7C/,"|");
            }
            return hash || '';
        }

        /**
         *  获取hash参数，hash参数目前都通过|分隔，key与value通过=链接，与url参数类似
         *  @params key,hashString
         *  @return paramString
         * */
        function _getParams(key, hashString) {
            var hashStr = hashString;
            var reg = new RegExp("\\|" + key + "\\=(.*?)(\\||$)");
            var matches = hashString.match(reg) || false;
            if (matches && matches[1]) {
                return matches[1];
            } else {
                return false;
            }
        }

        /**
         *  解析hash参数，返回数组
         * */
        function _hashParse(hashString) {
            var hashArr = hashString.split('|');
            var results = {},
                item,result;
            for(var i in hashArr) {
                item = hashArr[i];
                if(item != '') {
                    result = item.split("=");
                    if(result.length == 2) {
                        results[result[0]] = decodeURIComponent(result[1]);
                    }
                }
            }
            return results;
        }


        /**
         *  Hash变更时触发
         *  @params e:hash change event，oldState：hash变更前的状态，newState：当前的状态，diffs：两个状态的diff
         *
         * */
        function onChange(e, oldState, newState, diffs) {
            var newKey, oldKey, newValue, oldValue;
            diffs.forEach(function(diff) {
                var action = diff.type;

                if(action == 'removed' || action == 'modified') {
                    oldKey = diff.key;
                    oldValue = diff.oldValue;
                }
                
                if(action == 'added' || action == 'modified') {
                    newKey = diff.key;
                    newValue = diff.newValue;
                }

            });

            scope.last = {
                "path" : oldKey || "base",
                "params" : oldValue
            };
            scope.path = newKey || "base";
            scope.params = newValue;
            controller.run(scope.path, scope).then(function() {
                _routeState = "natural";
                scope.routeStatus = {
                    "action" : "history",
                    "type" : "natural"
                };
            });
            current.path = scope.path;
            current.params = scope.params;
        }

        /**
         *  route初始化函数
         * */
        function init() {
            require(["sf/controller"], function(Controller) {
                controller = Controller;    
            });
        }

        /**
         * route开始执行 
         * */
        function start() {
            if (! (HASH = B.hash) || STARTED === true) {
                return;
            }
            HASH.on('change', onChange);        
            var hashResult = _hashParse(_getHash(location.href));
            //初始化处理hash，默认scope的last无任何状态
            var scope = {
                "last" : {
                    "path" : "",
                    "params" : ""
                },
                "path" : "",
                "params" : ""
            };
            //按照规范，不应该存在一次执行两个controller的情况，controller之间应该保持状态独立，但为了兼容结果页目前的情况，会按照hash顺序执行多个controller
            for(var i in hashResult) {
                scope.params = hashResult[i]; 
                scope.path = i;
                controller.run(i, scope).then(function() {
                    _routeState = "natural";
                });
                current.path = i;
                current.params = hashResult[i];
            }

            STARTED = true
        }

        /**
         *  内部初始化，时机在dom渲染之前，目前主要用于兼容刷新带hash的情况
         * */
        function _init() {
            var hashResult = _hashParse(_getHash(location.href));
            var BASEID = "#page"
            for(var i in hashResult) {
                if(i == 'act') {
                    var style = document.createElement('style');
                    style.id = 'activitystyle';
                    style.innerHTML = BASEID + '{width:100%;position:absolute;top:-99999px;visibility:hidden;}';
                    document.head.appendChild(style);
                    break;
                }
            }
        }

        _init();

        return {
            push : push,
            replace : replace,
            on : on,
            init : init,
            start : start,
            back : back,
            current : current,
            remove : remove
        }
    }

    if(!B.route) {
        B.route = new Route();        
    }

})(B);
