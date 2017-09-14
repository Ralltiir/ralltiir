/**
 * @file Router Frontend router via popstate and pushstate.
 * @author treelite<c.xinle@gmail.com>, Firede<firede@firede.us>
 * @module Router
 */

define(function (require) {
    var extend = require('../lang/underscore').extend;
    var globalConfig = require('./router/config');
    var controller = require('./router/controller');
    var _ = require('../lang/underscore');
    var logger = require('../utils/logger');

    function routerFactory() {
        /**
         * @constructor
         * @alias module:Router
         */
        var router = {};

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
         * 根据URL调用处理器
         *
         * @inner
         * @param {URL} url url对象
         * @param {Object} options 参数
         * @param {string} options.title 页面标题
         */
        function apply(url, options) {
            logger.log('router apply: ' + url);
            options = options || {};

            var handler;
            var query = extend({}, url.getQuery());
            var params = {};
            var path = url.getPath();

            handler = findHandler(url);
            if (!handler) {
                throw new Error('can not find route for: ' + path);
            }

            if (handler.path instanceof RegExp && handler.path.test(path)) {
                params = getParamsFromPath(path, handler);
            }

            var curState = {
                path: path,
                pathPattern: handler.raw,
                query: query,
                params: params,
                url: controller.ignoreRoot(url.toString()),
                originalUrl: url.toString(),
                options: options
            };
            var args = [curState, prevState];
            prevState = curState;

            logger.log('router calling handler: ' + handler.name);
            handler.fn.apply(handler.thisArg, args);
        }

        /**
         * Find handler object by Url Object
         *
         * @private
         * @param {Object} url The url object
         * @return {Object} the corresponding handler for the given url
         */
        function findHandler(url) {
            var handler;
            var defHandler;
            var path = url.getPath();
            logger.log('finding handlers for', url, 'in rules:', rules);
            rules.some(function (item) {
                if (item.path instanceof RegExp) {
                    if (item.path.test(path)) {
                        handler = item;
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
            return handler || defHandler;
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
         * Find registered path pattern by url
         *
         * @param {string} url The url string
         * @return {Object} The handler object associated with the given url
         */
        router.pathPattern = function (url) {
            url = controller.ignoreRoot(url);
            var urlObj = controller.createURL(url);
            var handler = findHandler(urlObj);
            if (!handler) {
                return null;
            }
            return handler.raw;
        };

        /**
         * 重置当前的URL
         *
         * @public
         * @param {string} url 路径
         * @param {Object} query 查询条件
         * @param {Object} options 选项
         * @param {boolean} options.silent 是否静默重置，静默重置只重置URL，不加载action
         */
        router.reset = function (url, query, options) {
            controller.reset(url, query, options);
        };

        /**
         * 设置配置信息
         *
         * @public
         * @param {Object} options 配置信息
         * @param {string} options.path 默认路径
         * @param {string} options.index index文件名称
         * @param {string} options.mode 路由模式，可选async、page，默认为async
         */
        router.config = function (options) {
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
         * @param {string|RegExp} path 路径
         * @param {function(path, query)} fn 路由处理函数
         * @param {Object} thisArg 路由处理函数的this指针
         */
        router.add = function (path, fn, thisArg) {
            if (indexOfHandler(path) >= 0) {
                throw new Error('path already exist');
            }

            var rule = {
                raw: path,
                path: path,
                fn: fn,
                thisArg: thisArg
            };

            if (_.isString(path) && _.contains(path, ':')) {
                rule = extend(rule, restful(path));
            }

            rules.push(rule);
        };

        /**
         * 删除路由规则
         *
         * @public
         * @param {string} path 路径
         */
        router.remove = function (path) {
            var i = indexOfHandler(path);
            if (i >= 0) {
                rules.splice(i, 1);
            }
        };

        /**
         * 测试路由规则存在性
         *
         * @public
         * @param {string} path 路径
         * @return {boolean} 是否存在
         */
        router.exist = function (path) {
            return indexOfHandler(path) >= 0;
        };

        /**
         * 清除所有路由规则
         *
         * @public
         */
        router.clear = function () {
            rules = [];
        };

        /**
         * URL跳转
         *
         * @public
         * @param {string} url 路径
         * @param {?Object} query 查询条件
         * @param {Object} options 跳转参数
         * @param {string} options.title 跳转后页面的title
         * @param {boolean} options.force 是否强制跳转
         * @param {boolean} options.silent 是否静默跳转（不改变URL）
         */
        router.redirect = function (url, query, options) {
            logger.log('router redirecting to: ' + url);
            controller.redirect(url, query, options);
        };

        /**
         * 启动路由监控
         *
         * @public
         * @param {Object} options 配置项
         */
        router.start = function (options) {
            router.config(options);
            controller.init(apply);
        };

        /**
         * 停止路由监控
         *
         * @public
         */
        router.stop = function () {
            controller.dispose();
            router.clear();
            prevState = {};
        };

        /**
         * 更换控制器
         * 仅用于单元测试及自定义控制器的调试
         * TODO: re-implement this via DI
         *
         * @public
         * @param {Object} implement 路由控制器
         */
        router.controller = function (implement) {
            var tmp = controller;
            controller = implement;
            _.forOwn(tmp, function (v, k) {
                if (!controller.hasOwnProperty(k)) {
                    controller[k] = v;
                }
            });
        };

        /**
         * 获取当前状态
         *
         * @return {Object} 返回上一次调度后的状态
         */
        router.getState = function () {
            return prevState;
        };

        router.ignoreRoot = controller.ignoreRoot;
        router.createURL = controller.createURL;

        return router;
    }
    return routerFactory;
});
