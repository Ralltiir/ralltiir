/**
 * @file controller
 * @author treelite(c.xinle@gmail.com), Firede(firede@firede.us)
 */

define(function (require) {
    var _ = require('../../lang/underscore');
    var URL = require('./URL');
    var config = require('./config');
    var applyHandler;
    var curLocation;

    /**
     * 调用路由处理器
     *
     * @inner
     * @param {URL} url URL对象
     * @param {Object} options 参数
     */
    function callHandler(url, options) {
        if (equalWithCurLocation(url, options)) {
            return;
        }
        applyHandler(url, options);
        curLocation = url;
    }

    /**
     * 判断是否与当前路径相等
     *
     * @inner
     * @param {URL} url URL对象
     * @param {Object} options 参数
     * @return {boolean}
     */
    function equalWithCurLocation(url, options) {
        return curLocation && url.equal(curLocation) && !options.force;
    }

    /**
     * url忽略root
     *
     * @inner
     * @param {string} url url
     * @return {string}
     */
    function ignoreRoot(url) {
        var root = config.root;
        if (url.charAt(0) === '/' && root) {
            if (url.indexOf(root) === 0) {
                url = url.replace(root, '');
            }
            else {
                // 绝对地址超出了root的范围
                // 转化为相对路径
                var dirs = root.split('/').slice(1);
                dirs = dirs.map(function () {
                    return '..';
                });
                url = dirs.join('/') + url;
                // 此时的相对路径是针对root的
                // 所以把curlocation置为空
                curLocation = null;
            }
        }

        return url;
    }

    /**
     * 创建URL对象
     *
     * @inner
     * @param {string=} url url字符串
     * @param {Object=} query 查询条件
     * @return {URL}
     */
    function createURL(url, query) {
        if (!url) {
            url = ignoreRoot(location.pathname);
        }
        return new URL(url, {query: query, base: curLocation});
    }

    /**
     * 路由监控
     *
     * @inner
     * @param {Object=} e 事件参数
     * @param {boolean} isSync 是否为同步渲染
     * @return {*}
     */
    function monitor(e, isSync) {
        e = e || {};

        if (_.get(e, 'state.disableServiceDispatch')) {
            return;
        }

        var url = ignoreRoot(location.pathname);
        if (location.search.length > 1) {
            url += location.search;
        }
        url = createURL(url);

        if (url.outRoot) {
            return outOfControl(url.toString(), true);
        }

        var options = isSync ? {src: 'sync'} : _.extend({}, e.state, {src: 'history'});
        callHandler(url, options);
    }

    var exports = {};

    /**
     * URL超出控制范围
     *
     * @inner
     * @param {string} url url地址
     * @param {boolean} silent 是否不添加历史纪录 默认为false
     */
    function outOfControl(url, silent) {
        exports.dispose();

        if (silent) {
            location.replace(url);
        }
        else {
            location.href = url;
        }
    }

    /**
     * 初始化
     *
     * @public
     * @param {Function} apply 调用路由处理器
     */
    exports.init = function (apply) {
        window.addEventListener('popstate', monitor, false);
        applyHandler = apply;

        // 首次调用为同步渲染
        monitor(null, true);
    };

    /**
     * 路由跳转
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 跳转参数
     * @param {boolean=} options.force 是否强制跳转
     * @param {boolean=} options.silent 是否静默跳转（不改变URL）
     * @return {*}
     */
    exports.redirect = function (url, query, options) {
        options = options || {};
        url = createURL(url, query);

        if (url.outRoot || config.mode === 'page') {
            return !equalWithCurLocation(url, options) && outOfControl(url.toString());
        }

        if (!curLocation.equalWithFragment(url)) {
            history.pushState(options, options.title, url.toString());
        }
        if (!options.silent) {
            callHandler(url, options);
        }
    };

    /**
     * 重置当前的URL
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 重置参数
     * @param {boolean=} options.silent 是否静默重置，静默重置只重置URL，不加载action
     * @return {*}
     */
    exports.reset = function (url, query, options) {
        options = options || {};
        url = createURL(url, query);

        if (url.outRoot || config.mode === 'page') {
            return !equalWithCurLocation(url, options) && outOfControl(url.toString());
        }

        if (!options.silent) {
            callHandler(url, options);
        }
        else {
            curLocation = url;
        }
        history.replaceState(options, options.title, url.toString());
    };

    /**
     * 销毁
     *
     * @public
     */
    exports.dispose = function () {
        window.removeEventListener('popstate', monitor, false);
        curLocation = null;
    };

    exports.ignoreRoot = ignoreRoot;

    exports.createURL = createURL;

    return exports;
});
