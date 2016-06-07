/**
 * @file 路由管理
 * @author treelite(c.xinle@gmail.com), Firede(firede@firede.us)
 */

define(function (require) {

    var extend = require('./lang/extend');
    var globalConfig = require('./router/config');
    var controller = require('./router/controller');

    var exports = {};

    /**
     * 路由规则
     *
     * @type {Array.<Object>}
     */
    var rules = [];

    /**
     * 上一次的route信息
     *
     * @type {Object}
     */
    var prevState = {};

    /**
     * 判断是否已存在路由处理器
     *
     * @inner
     * @param {string|RegExp} path 路径
     * @return {number}
     */
    function indexOfHandler(path) {
        var index = -1;

        path = path.toString();
        rules.some(function (item, i) {
            // toString是为了判断正则是否相等
            if (item.raw.toString() === path) {
                index = i;
            }
            return index !== -1;
        });

        return index;
    }

    /**
     * 从path中获取query
     * 针对正则表达式的规则
     *
     * @inner
     * @param {string} path 路径
     * @param {Object} item 路由信息
     * @return {Object}
     */
    function getParamsFromPath(path, item) {
        var res = {};
        var names = item.params || [];
        var params = path.match(item.path) || [];

        for (var i = 1, name; i < params.length; i++) {
            name = names[i - 1] || '$' + i;
            res[name] = decodeURIComponent(params[i]);
        }

        return res;
    }

    /**
     * 是否正在等待处理器执行
     *
     * @type {boolean}
     */
    var pending = false;

    /**
     * 等待调用处理器的参数
     *
     * @type {!Object}
     */
    var waitingRoute;

    /**
     * 根据URL调用处理器
     *
     * @inner
     * @param {URL} url url对象
     * @param {Object=} options 参数
     * @param {string=} options.title 页面标题
     */
    function apply(url, options) {
        options = options || {};

        // 只保存最后一次的待调用信息
        if (pending) {
            waitingRoute = {
                url: url,
                options: options
            };
            return;
        }

        function finish() {
            pending = false;
            if (waitingRoute) {
                var route = extend({}, waitingRoute);
                waitingRoute = null;
                apply(route.url, route.options);
            }
        }

        pending = true;

        var handler;
        var defHandler;
        var query = extend({}, url.getQuery());
        var params = {};
        var path = url.getPath();

        rules.some(function (item) {
            if (item.path instanceof RegExp) {
                if (item.path.test(path)) {
                    handler = item;
                    params = getParamsFromPath(path, item);
                }
            }
            else if (url.equalPath(item.path)) {
                handler = item;
            }

            if (!item.path) {
                defHandler = item;
            }

            return !!handler;
        });

        handler = handler || defHandler;

        if (!handler) {
            waitingRoute = null;
            pending = false;
            throw new Error('can not found route for: ' + path);
        }

        if (options.title) {
            document.title = options.title;
        }

        var curState = {
            path: path,
            query: query,
            params: params,
            url: url.toString(),
            options: options
        };
        var args = [curState, prevState];
        prevState = curState;

        if (handler.fn.length > args.length) {
            args.push(finish);
            handler.fn.apply(handler.thisArg, args);
        }
        else {
            handler.fn.apply(handler.thisArg, args);
            finish();
        }
    }

    /**
     * 处理RESTful风格的路径
     * 使用正则表达式
     *
     * @inner
     * @param {string} path 路径
     * @return {Object}
     */
    function restful(path) {
        var res = {
            params: []
        };

        res.path = path.replace(/:([^/]+)/g, function ($0, $1) {
            res.params.push($1);
            return '([^/]+)';
        });

        res.path = new RegExp('^' + res.path + '$');

        return res;
    }

    /**
     * 添加路由规则
     *
     * @inner
     * @param {string} path 路径
     * @param {Function} fn 路由处理函数
     * @param {Object} thisArg 路由处理函数的this指针
     */
    function addRule(path, fn, thisArg) {
        var rule = {
                raw: path,
                path: path,
                fn: fn,
                thisArg: thisArg
            };

        if (!(path instanceof RegExp)
            && path.indexOf(':') >= 0
        ) {
            rule = extend(rule, restful(path));
        }

        rules.push(rule);
    }

    /**
     * 重置当前的URL
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 选项
     * @param {boolean=} options.silent 是否静默重置，静默重置只重置URL，不加载action
     */
    exports.reset = function (url, query, options) {
        controller.reset(url, query, options);
    };

    /**
     * 设置配置信息
     *
     * @public
     * @param {Object} options 配置信息
     * @param {string=} options.path 默认路径
     * @param {string=} options.index index文件名称
     * @param {string=} options.mode 路由模式，可选async、page，默认为async
     */
    exports.config = function (options) {
        options = options || {};
        // 修正root，添加头部的`/`并去掉末尾的'/'
        var root = options.root;
        if (root && root.charAt(root.length - 1) === '/') {
            root = options.root = root.substring(0, root.length - 1);
        }
        if (root && root.charAt(0) !== '/') {
            options.root = '/' + root;
        }
        extend(globalConfig, options);
    };

    /**
     * 添加路由规则
     *
     * @public
     * @param {string|RegExp=} path 路径
     * @param {function(path, query)} fn 路由处理函数
     * @param {Object=} thisArg 路由处理函数的this指针
     */
    exports.add = function (path, fn, thisArg) {
        if (indexOfHandler(path) >= 0) {
            throw new Error('path has been existed');
        }
        addRule(path, fn, thisArg);
    };

    /**
     * 删除路由规则
     *
     * @public
     * @param {string} path 路径
     */
    exports.remove = function (path) {
        var i = indexOfHandler(path);
        if (i >= 0) {
            rules.splice(i, 1);
        }
    };

    /**
     * 清除所有路由规则
     *
     * @public
     */
    exports.clear = function () {
        rules = [];
    };

    /**
     * URL跳转
     *
     * @public
     * @param {string} url 路径
     * @param {?Object} query 查询条件
     * @param {Object=} options 跳转参数
     * @param {string=} options.title 跳转后页面的title
     * @param {boolean=} options.force 是否强制跳转
     * @param {boolean=} options.silent 是否静默跳转（不改变URL）
     */
    exports.redirect = function (url, query, options) {
        controller.redirect(url, query, options);
    };

    /**
     * 启动路由监控
     *
     * @public
     * @param {Object} options 配置项
     */
    exports.start = function (options) {
        exports.config(options);
        controller.init(apply);
    };

    /**
     * 停止路由监控
     *
     * @public
     */
    exports.stop = function () {
        controller.dispose();
        exports.clear();
        waitingRoute = null;
        prevState = {};
    };

    /**
     * 更换控制器
     * 仅用于单元测试及自定义控制器的调试
     *
     * @public
     * @param {Object} implement 路由控制器
     */
    exports.controller = function (implement) {
        controller = implement;
    };

    return exports;
});
