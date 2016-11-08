/*router*/
/**
 * saber-lang
 *
 * @file  extend
 * @author  firede[firede@firede.us]
 */

define('sfr/router/lang/extend', ['require'], function (require) {

    /**
     * 对象属性拷贝
     *
     * @param {Object} target 目标对象
     * @param {...Object} source 源对象
     * @return {Object}
     */
    function extend(target, source) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];

            if (!source) {
                continue;
            }

            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }

        }

        return target;
    }

    return extend;

});
;
/**
 * saber-lang
 *
 * @file  inherits
 * @author  firede[firede@firede.us]
 */

define('sfr/router/lang/inherits', ['require'], function (require) {

    /**
     * 为类型构造器建立继承关系
     *
     * @param {Function} subClass 子类构造器
     * @param {Function} superClass 父类构造器
     * @return {Function}
     */
    function inherits(subClass, superClass) {
        var Empty = function () {};
        Empty.prototype = superClass.prototype;
        var selfPrototype = subClass.prototype;
        var proto = subClass.prototype = new Empty();

        for (var key in selfPrototype) {
            if (selfPrototype.hasOwnProperty(key)) {
                proto[key] = selfPrototype[key];
            }
        }
        subClass.prototype.constructor = subClass;

        return subClass;
    }

    return inherits;

});
;
/**
 * @file  Event Emitter
 * @author  Firede(firede@firede.us)
 */

define('sfr/router/emitter', ['require'], function (require) {

    /**
     * Emitter
     *
     * @exports Emitter
     * @constructor
     */
    function Emitter() {}

    /**
     * Emitter的prototype（为了便于访问）
     *
     * @inner
     */
    var proto = Emitter.prototype;

    /**
     * 获取事件列表
     * 若还没有任何事件则初始化列表
     *
     * @private
     * @return {Object}
     */
    proto._getEvents = function () {
        if (!this._events) {
            this._events = {};
        }

        return this._events;
    };

    /**
     * 获取最大监听器个数
     * 若尚未设置，则初始化最大个数为10
     *
     * @private
     * @return {number}
     */
    proto._getMaxListeners = function () {
        if (isNaN(this.maxListeners)) {
            this.maxListeners = 10;
        }

        return this.maxListeners;
    };

    /**
     * 挂载事件
     *
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.on = function (event, listener) {
        var events = this._getEvents();
        var maxListeners = this._getMaxListeners();

        events[event] = events[event] || [];

        var currentListeners = events[event].length;
        if (currentListeners >= maxListeners && maxListeners !== 0) {
            throw new RangeError(
                'Warning: possible Emitter memory leak detected. '
                + currentListeners
                + ' listeners added.'
           );
        }

        events[event].push(listener);

        return this;
    };

    /**
     * 挂载只执行一次的事件
     *
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.once = function (event, listener) {
        var me = this;

        function on() {
            me.off(event, on);
            listener.apply(this, arguments);
        }
        // 挂到on上以方便删除
        on.listener = listener;

        this.on(event, on);

        return this;
    };

    /**
     * 注销事件与监听器
     * 任何参数都`不传`将注销当前实例的所有事件
     * 只传入`event`将注销该事件下挂载的所有监听器
     * 传入`event`与`listener`将只注销该监听器
     *
     * @public
     * @param {string=} event 事件名
     * @param {Function=} listener 监听器
     * @return {Emitter}
     */
    proto.off = function (event, listener) {
        var events = this._getEvents();

        // 移除所有事件
        if (0 === arguments.length) {
            this._events = {};
            return this;
        }

        var listeners = events[event];
        if (!listeners) {
            return this;
        }

        // 移除指定事件下的所有监听器
        if (1 === arguments.length) {
            delete events[event];
            return this;
        }

        // 移除指定监听器（包括对once的处理）
        var cb;
        for (var i = 0; i < listeners.length; i++) {
            cb = listeners[i];
            if (cb === listener || cb.listener === listener) {
                listeners.splice(i, 1);
                break;
            }
        }
        return this;
    };

    /**
     * 触发事件
     *
     * @public
     * @param {string} event 事件名
     * @param {...*} args 传递给监听器的参数，可以有多个
     * @return {Emitter}
     */
    proto.emit = function (event) {
        var events = this._getEvents();
        var listeners = events[event];
        // 内联arguments的转化 提升性能
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        if (listeners) {
            listeners = listeners.slice(0);
            for (i = 0; i < listeners.length; i++) {
                listeners[i].apply(this, args);
            }
        }

        return this;
    };

    /**
     * 返回指定事件的监听器列表
     *
     * @public
     * @param {string} event 事件名
     * @return {Array} 监听器列表
     */
    proto.listeners = function (event) {
        var events = this._getEvents();
        return events[event] || [];
    };

    /**
     * 设置监听器的最大个数，为0时不限制
     *
     * @param {number} number 监听器个数
     * @return {Emitter}
     */
    proto.setMaxListeners = function (number) {
        this.maxListeners = number;

        return this;
    };

    var protoKeys = Object.keys(proto);

    /**
     * 将Emitter混入目标对象
     *
     * @param {Object} obj 目标对象
     * @return {Object} 混入Emitter后的对象
     */
    Emitter.mixin = function (obj) {
        // forIn不利于V8的优化
        var key;
        for (var i = 0, max = protoKeys.length; i < max; i++) {
            key = protoKeys[i];
            obj[key] = proto[key];
        }
        return obj;
    };

    // Export
    return Emitter;

});
;
/**
 * @file url处理
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/router/URL', ['require', 'sfr/router/uri/component/Path', 'sfr/router/uri/component/Query', 'sfr/router/uri/component/Fragment', 'sfr/router/router/config'], function (require) {

    var Path = require('sfr/router/uri/component/Path');
    var Query = require('sfr/router/uri/component/Query');
    var Fragment = require('sfr/router/uri/component/Fragment');
    var config = require('sfr/router/router/config');

    var DEFAULT_TOKEN = '?';

    /**
     * URL
     *
     * @constructor
     * @param {string} str url
     * @param {Object=} options 选项
     * @param {Object=} options.query 查询条件
     * @param {URL=} options.base 基路径
     * @param {string=} options.root 根路径
     */
    function URL(str, options) {
        options = options || {};

        str = (str || '').trim() || config.path;

        var token = this.token = options.token || DEFAULT_TOKEN;
        var root = options.root || config.root;
        if (root.charAt(root.length - 1) === '/') {
            root = root.substring(0, root.length - 1);
        }
        this.root = root;

        str = str.split('#');
        this.fragment = new Fragment(str[1]);

        str = str[0].split(token);
        var base = options.base || {};
        this.path = new Path(str[0], base.path);
        this.query = new Query(str[1]);

        // 路径修正
        // * 针对相对路径修正
        // * 添加默认的'/'
        var path = this.path.get();
        this.outRoot = path.indexOf('..') === 0;
        if (this.outRoot) {
            path = Path.resolve(root + '/', path);
            if (path.indexOf(root) === 0) {
                path = path.substring(root.length);
                this.path.set(path);
                this.outRoot = false;
            }
        }

        if (!this.outRoot && path.charAt(0) !== '/') {
            this.path.set('/' + path);
        }

        if (options.query) {
            this.query.add(options.query);
        }
    }

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    URL.prototype.toString = function () {
        var root = this.root;
        var path = this.path.get();
        if (this.outRoot) {
            path = Path.resolve(root + '/', path);
        }
        else {
            path = root + path;
        }

        return path
            + this.query.toString(this.token)
            + this.fragment.toString();
    };

    /**
     * 比较Path
     *
     * @public
     * @param {string} path 路径
     * @return {boolean}
     */
    URL.prototype.equalPath = function (path) {
        return this.path.get() === path;
    };

    /**
     * 比较Path与Query是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equal = function (url) {
        return this.query.equal(url.query)
            && this.equalPath(url.path.get());
    };

    /**
     * 比较Path, Query及Fragment是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equalWithFragment = function (url) {
        return this.equal(url)
            && this.fragment.equal(url.fragment);
    };

    /**
     * 获取查询条件
     *
     * @public
     * @return {Object}
     */
    URL.prototype.getQuery = function () {
        return this.query.get();
    };

    /**
     * 获取路径
     *
     * @public
     * @return {string}
     */
    URL.prototype.getPath = function () {
        return this.path.get();
    };

    return URL;

});
;
/**
 * @file 配置信息
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/router/config', [], {

    /**
     * 默认的路径
     * 只对hash控制器生效
     *
     * @type {string}
     */
    path: '/',

    /**
     * 默认的根路径
     *
     * @type {string}
     */
    root: '',

    /**
     * 路由模式
     * 可选async或page
     *
     * @type {string}
     */
    mode: 'async'

});
;
/**
 * @file controller
 * @author treelite(c.xinle@gmail.com), Firede(firede@firede.us)
 */

define('sfr/router/router/controller', ['require', 'sfr/router/lang/extend', 'sfr/router/router/URL', 'sfr/router/router/config'], function (require) {

    var extend = require('sfr/router/lang/extend');
    var URL = require('sfr/router/router/URL');
    var config = require('sfr/router/router/config');
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

        var url = ignoreRoot(location.pathname);
        if (location.search.length > 1) {
            url += location.search;
        }
        url = createURL(url);

        if (url.outRoot) {
            return outOfControl(url.toString(), true);
        }

        var options = isSync ? {src: 'sync'} : extend({src: 'history'}, e.state);
        callHandler(url, options);
    }

    /**
     * 获取元素的本页跳转地址
     *
     * @inner
     * @param {HTMLElement} ele DOM元素
     * @return {!string}
     */
    function getLink(ele) {
        var target = ele.getAttribute('target');
        var href = ele.getAttribute('href');

        if (!href || (target && target !== '_self')) {
            return;
        }

        return href.charAt(0) !== '#' && href.indexOf(':') < 0 && href;
    }

    var exports = {};

    /**
     * 劫持全局的click事件
     *
     * @inner
     * @param {Event} e 事件参数
     */
    function hackClick(e) {
        var target = e.target;
        // 先上寻找A标签
        if (e.path) {
            for (var i = 0, item; item = e.path[i]; i++) {
                if (item.tagName === 'A') {
                    target = item;
                    break;
                }
            }
        }
        else {
            while (target && target.tagName !== 'A') {
                target = target.parentNode;
            }
        }

        if (!target) {
            return;
        }

        var href = getLink(target);
        if (href) {
            exports.redirect(ignoreRoot(href), null, {src: 'hijack'});
            e.preventDefault();
        }
    }

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
        //document.body.addEventListener('click', hackClick, false);
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

        if (!curLocation.equalWithFragment(url) && !options.silent) {
            history.pushState(options, options.title, url.toString());
        }

        callHandler(url, options);
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
        //document.body.removeEventListener('click', hackClick, false);
        curLocation = null;
    };

    return exports;

});
;
/**
 * @file 路由管理
 * @author treelite(c.xinle@gmail.com), Firede(firede@firede.us)
 */

define('sfr/router/router', ['require', 'sfr/router/lang/extend', 'sfr/router/router/config', 'sfr/router/router/controller'], function (require) {

    var extend = require('sfr/router/lang/extend');
    var globalConfig = require('sfr/router/router/config');
    var controller = require('sfr/router/router/controller');

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
     * @param {Object} options 参数
     * @param {String} options.title 页面标题
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
            pathPattern: handler.raw,
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
     * @param {String} url 路径
     * @param {Object} query 查询条件
     * @param {Object} options 选项
     * @param {Boolean} options.silent 是否静默重置，静默重置只重置URL，不加载action
     */
    exports.reset = function (url, query, options) {
        controller.reset(url, query, options);
    };

    /**
     * 设置配置信息
     *
     * @public
     * @param {Object} options 配置信息
     * @param {String} options.path 默认路径
     * @param {String} options.index index文件名称
     * @param {String} options.mode 路由模式，可选async、page，默认为async
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
     * @param {string|RegExp} path 路径
     * @param {function(path, query)} fn 路由处理函数
     * @param {Object} thisArg 路由处理函数的this指针
     */
    exports.add = function (path, fn, thisArg) {
        if (indexOfHandler(path) >= 0) {
            throw new Error('path already exist');
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
     * 测试路由规则存在性
     *
     * @public
     * @param {string} path 路径
     */
    exports.exist = function (path) {
        return indexOfHandler(path) >= 0;
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
     * @param {Object} options 跳转参数
     * @param {String} options.title 跳转后页面的title
     * @param {Boolean} options.force 是否强制跳转
     * @param {Boolean} options.silent 是否静默跳转（不改变URL）
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
;
/**
 * @file URI main file
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri', ['require', 'sfr/router/uri/URI', 'sfr/router/uri/util/uri-parser', 'sfr/router/uri/component/Path'], function (require) {

    var URI = require('sfr/router/uri/URI');

    /**
     * 创建URI对象
     *
     * @public
     * @param {...string|Object} data uri
     * @return {Object}
     */
    var exports = function (data) {
        return new URI(data);
    };


    /**
     * 解析URI字符串
     *
     * @public
     * @param {string} str URI字符串
     * @return {Object}
     */
    exports.parse = require('sfr/router/uri/util/uri-parser');

    /**
     * resolve path
     *
     * @public
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    exports.resolve = require('sfr/router/uri/component/Path').resolve;

    return exports;
});
;
/**
 * @file URI
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/URI', ['require', 'sfr/router/uri/util/uri-parser', 'sfr/router/uri/component/Scheme', 'sfr/router/uri/component/UserName', 'sfr/router/uri/component/Password', 'sfr/router/uri/component/Host', 'sfr/router/uri/component/Port', 'sfr/router/uri/component/Path', 'sfr/router/uri/component/Query', 'sfr/router/uri/component/Fragment'], function (require) {

    var parseURI = require('sfr/router/uri/util/uri-parser');

    /**
     * 属性构造函数
     *
     * @const
     * @type {Object}
     */
    var COMPONENTS = {
        scheme: require('sfr/router/uri/component/Scheme'),
        username: require('sfr/router/uri/component/UserName'),
        password: require('sfr/router/uri/component/Password'),
        host: require('sfr/router/uri/component/Host'),
        port: require('sfr/router/uri/component/Port'),
        path: require('sfr/router/uri/component/Path'),
        query: require('sfr/router/uri/component/Query'),
        fragment: require('sfr/router/uri/component/Fragment')
    };

    /**
     * URI
     *
     * @contructor
     * @param {string|Object} data URL
     */
    function URI(data) {
        data = parseURI(data);

        var Factory;
        var me = this;
        Object.keys(COMPONENTS).forEach(function (name) {
            Factory = COMPONENTS[name];
            me[name] = new Factory(data[name]);
        });
    }

    /**
     * 字符串化authority
     *
     * @inner
     * @param {URI} uri URI对象
     * @return {string}
     */
    function stringifyAuthority(uri) {
        var res = [];
        var username = uri.username.toString();
        var password = uri.password.toString();
        var host = uri.host.toString();
        var port = uri.port.toString();

        if (username || password) {
            res.push(username + ':' + password + '@');
        }

        res.push(host);
        res.push(port);

        return res.join('');
    }

    /**
     * 设置属性
     *
     * @public
     * @param {string=} name 属性名称
     * @param {...*} args 数据
     */
    URI.prototype.set = function () {
        var i = 0;
        var arg = {};
        if (arguments.length > 1) {
            arg.name = arguments[i++];
        }
        arg.data = Array.prototype.slice.call(arguments, i);

        var component = this[arg.name];
        if (component) {
            component.set.apply(component, arg.data);
        }
        else {
            var me = this;
            var data = parseURI(arg.data[0]);
            Object.keys(COMPONENTS).forEach(function (name) {
                me[name].set(data[name]);
            });
        }
    };

    /**
     * 获取属性
     *
     * @public
     * @param {string} name 属性名称
     * @return {*}
     */
    URI.prototype.get = function () {
        var arg = {
                name: arguments[0],
                data: Array.prototype.slice.call(arguments, 1)
            };
        var component = this[arg.name];

        if (component) {
            return component.get.apply(component, arg.data);
        }
    };

    /**
     * 转化成字符串
     *
     * @public
     * @param {string=} name 属性名称
     * @return {string}
     */
    URI.prototype.toString = function (name) {
        var str;
        var component = this[name];

        if (component) {
            str = component.toString();
        }
        else {
            str = [];
            var scheme = this.scheme.toString();
            if (scheme) {
                str.push(scheme + ':');
            }
            var authority = stringifyAuthority(this);
            if (scheme && authority) {
                str.push('//');
            }
            str.push(authority);
            str.push(this.path.toString());
            str.push(this.query.toString());
            str.push(this.fragment.toString());
            str = str.join('');
        }

        return str;
    };

    /**
     * 比较uri
     *
     * @public
     * @param {string|URI} uri 待比较的URL对象
     * @return {boolean}
     */
    URI.prototype.equal = function (uri) {
        if (!(uri instanceof URI)) {
            uri = new URI(uri);
        }

        var res = true;
        var names = Object.keys(COMPONENTS);

        for (var i = 0, name; res && (name = names[i]); i++) {
            if (name === 'port') {
                res = this[name].equal(uri[name].get(), this.scheme.get());
            }
            else {
                res = this[name].equal(uri[name]);
            }
        }

        return res;
    };

    return URI;

});
;
/**
 * @file abstract component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/Abstract', ['require'], function (require) {

    /**
     * URI Component 虚基类
     * 提供基础方法
     *
     * @constructor
     * @param {string} data 数据
     */
    function Abstract() {
        var args = Array.prototype.slice.call(arguments);
        this.set.apply(this, args);
    }

    /**
     * 获取数据
     *
     * @public
     * @return {string}
     */
    Abstract.prototype.get = function () {
        return this.data;
    };

    /**
     * 设置数据
     *
     * @public
     * @param {string} data 数据
     */
    Abstract.prototype.set = function (data) {
        this.data = data || '';
    };

    /**
     * 添加数据
     *
     * @public
     * @param {string} data 数据
     */
    Abstract.prototype.add = function (data) {
        this.set(data);
    };

    /**
     * 移除数据
     *
     * @public
     */
    Abstract.prototype.remove = function () {
        this.data = '';
    };

    /**
     * 字符串输出
     *
     * @public
     * @return {string}
     */
    Abstract.prototype.toString = function () {
        return this.data.toString();
    };

    /**
     * 数据比较
     *
     * @public
     * @param {Object} data 带比较对象
     * @return {boolean}
     */
    Abstract.prototype.equal = function (data) {
        if (data instanceof Abstract) {
            data = data.get();
        }
        // 需要类型转化的比较
        /* eslint-disable eqeqeq */
        return this.data == data;
        /* eslint-enable eqeqeq */
    };

    return Abstract;
});
;
/**
 * @file fragment component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/Fragment', ['require', 'sfr/router/lang/inherits', 'sfr/router/uri/component/Abstract'], function (require) {
    var inherits = require('sfr/router/lang/inherits');
    var Abstract = require('sfr/router/uri/component/Abstract');

    var DEFAULT_PREFIX = '#';

    /**
     * Fragment
     *
     * @constructor
     * @param {string} data 数据
     */
    function Fragment(data) {
        Abstract.call(this, data);
    }

    inherits(Fragment, Abstract);

    /**
     * 字符串化
     *
     * @public
     * @param {string=} prefix 前缀分割符
     * @return {string}
     */
    Fragment.prototype.toString = function (prefix) {
        prefix = prefix || DEFAULT_PREFIX;
        return this.data ? prefix + this.data : '';
    };

    return Fragment;
});
;
/**
 * @file host component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/Host', ['require', 'sfr/router/lang/inherits', 'sfr/router/uri/component/Abstract'], function (require) {
    var inherits = require('sfr/router/lang/inherits');
    var Abstract = require('sfr/router/uri/component/Abstract');

    /**
     * Host
     *
     * @constructor
     * @param {string} data 数据
     */
    function Host(data) {
        Abstract.call(this, data);
    }

    inherits(Host, Abstract);

    /**
     * 设置host
     * 忽略大小写
     *
     * @public
     * @param {string} host Host
     */
    Host.prototype.set = function (host) {
        host = host || '';
        this.data = host.toLowerCase();
    };

    /**
     * 比较host
     * 忽略大小写
     *
     * @public
     * @param {string|Host} host Host
     * @return {boolean}
     */
    Host.prototype.equal = function (host) {
        if (host instanceof Host) {
            host = host.get();
        }
        else {
            host = host || '';
        }
        return this.data === host.toLowerCase();
    };

    return Host;
});
;
/**
 * @file password component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/Password', ['require', 'sfr/router/lang/inherits', 'sfr/router/uri/component/Abstract'], function (require) {
    var inherits = require('sfr/router/lang/inherits');
    var Abstract = require('sfr/router/uri/component/Abstract');

    /**
     * Password
     *
     * @constructor
     * @param {string} data 数据
     */
    function Password(data) {
        Abstract.call(this, data);
    }

    inherits(Password, Abstract);

    return Password;
});
;
/**
 * @file path component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/Path', ['require', 'sfr/router/lang/inherits', 'sfr/router/uri/component/Abstract'], function (require) {
    var inherits = require('sfr/router/lang/inherits');
    var Abstract = require('sfr/router/uri/component/Abstract');

    /**
     * normalize path
     * see rfc3986 #6.2.3. Scheme-Based Normalization
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function normalize(path) {
        if (!path) {
            path = '/';
        }

        return path;
    }

    /**
     * 获取目录
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function dirname(path) {
        path = path.split('/');
        path.pop();
        return path.join('/');
    }

    /**
     * 处理路径中的相对路径
     *
     * @inner
     * @param {Array} paths 分割后的路径
     * @param {boolean} overRoot 是否已超出根目录
     * @return {Array}
     */
    function resolveArray(paths, overRoot) {
        var up = 0;
        for (var i = paths.length - 1, item; item = paths[i]; i--) {
            if (item === '.') {
                paths.splice(i, 1);
            }
            else if (item === '..') {
                paths.splice(i, 1);
                up++;
            }
            else if (up) {
                paths.splice(i, 1);
                up--;
            }
        }

        if (overRoot) {
            while (up-- > 0) {
                paths.unshift('..');
            }
        }

        return paths;
    }

    /**
     * Path
     *
     * @constructor
     * @param {string} data 路径
     * @param {string|Path=} base 相对路径
     */
    function Path(data, base) {
        Abstract.call(this, data, base);
    }

    /**
     * 应用路径
     *
     * @public
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    Path.resolve = function (from, to) {
        to = to || '';

        if (to.charAt(0) === '/') {
            return Path.resolve(to);
        }

        var isAbsolute = from.charAt(0) === '/';
        var isDir = false;
        if (to) {
            from = dirname(from);
            isDir = to.charAt(to.length - 1) === '/';
        }
        // 对于`/`不处理
        else if (from.length > 1) {
            isDir = from.charAt(from.length - 1) === '/';
        }

        var path = from.split('/')
            .concat(to.split('/'))
            .filter(
                function (item) {
                    return !!item;
                }
            );

        path = resolveArray(path, !isAbsolute);


        return (isAbsolute ? '/' : '')
            + (path.length > 0 ? path.join('/') + (isDir ? '/' : '') : '');
    };

    inherits(Path, Abstract);

    /**
     * 设置path
     *
     * @public
     * @param {string} path 路径
     * @param {string|Path=} base 相对路径
     */
    Path.prototype.set = function (path, base) {
        if (base instanceof Path) {
            base = base.get();
        }

        var args = [path || ''];
        if (base) {
            args.unshift(base);
        }
        this.data = Path.resolve.apply(Path, args);
    };

    /**
     * 比较path
     *
     * @public
     * @param {string|Path} path 路径
     * @return {boolean}
     */
    Path.prototype.equal = function (path) {
        var myPath = normalize(this.data);

        if (path instanceof Path) {
            path = normalize(path.get());
        }
        else {
            path = normalize(Path.resolve(path || ''));
        }

        return myPath === path;
    };

    /**
     * 应用路径
     *
     * @public
     * @param {string|Path} path 起始路径
     * @param {boolean} from 目标路径
     */
    Path.prototype.resolve = function (path, from) {
        if (path instanceof Path) {
            path = path.get();
        }

        var args = [this.data];
        if (from) {
            args.unshift(path);
        }
        else {
            args.push(path);
        }

        this.data = Path.resolve.apply(Path, args);
    };

    return Path;
});
;
/**
 * @file port component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/Port', ['require', 'sfr/router/lang/inherits', 'sfr/router/uri/component/Abstract'], function (require) {
    var inherits = require('sfr/router/lang/inherits');
    var Abstract = require('sfr/router/uri/component/Abstract');

    /**
     * 常见协议的默认端口号
     *
     * @const
     * @type {Object}
     */
    var DEFAULT_PORT = {
            ftp: '21',
            ssh: '22',
            telnet: '23',
            http: '80',
            https: '443',
            ws: '80',
            wss: '443'
        };

    /**
     * Prot
     *
     * @constructor
     * @param {string} data 端口号
     */
    function Port(data) {
        Abstract.call(this, data);
    }

    inherits(Port, Abstract);

    /**
     * 比较port
     *
     * @public
     * @param {string|Port} port 端口号
     * @param {string=} scheme 协议
     * @return {boolean}
     */
    Port.prototype.equal = function (port, scheme) {
        var myPort = this.data || DEFAULT_PORT[scheme];
        if (port instanceof Port) {
            port = port.get();
        }
        port = port || DEFAULT_PORT[scheme];

        return myPort === port;
    };

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    Port.prototype.toString = function () {
        return this.data ? ':' + this.data : '';
    };

    return Port;
});
;
/**
 * @file query component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/Query', ['require', 'sfr/router/lang/inherits', 'sfr/router/lang/extend', 'sfr/router/uri/component/Abstract', 'sfr/router/uri/util/parse-query', 'sfr/router/uri/util/stringify-query'], function (require) {
    var inherits = require('sfr/router/lang/inherits');
    var extend = require('sfr/router/lang/extend');
    var Abstract = require('sfr/router/uri/component/Abstract');

    var parse = require('sfr/router/uri/util/parse-query');
    var stringify = require('sfr/router/uri/util/stringify-query');

    /**
     * 默认的查询条件分割符
     *
     * @const
     * @type {string}
     */
    var DEFAULT_PREFIX = '?';

    /**
     * 判断对象
     *
     * @inner
     * @param {*} data 变量
     * @return {boolean}
     */
    function isObject(data) {
        return '[object Object]'
            === Object.prototype.toString.call(data);
    }

    /**
     * 判断字符串
     *
     * @inner
     * @param {*} str 变量
     * @return {boolean}
     */
    function isString(str) {
        return typeof str === 'string';
    }

    /**
     * 比较数组
     *
     * @inner
     * @param {Array} a 待比较数组
     * @param {Array} b 待比较数组
     * @return {boolean}
     */
    function compareArray(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            return false;
        }

        if (a.length !== b.length) {
            return false;
        }

        a = a.slice(0);
        a = a.slice(0);
        a.sort();
        b.sort();

        var res = true;
        for (var i = 0, len = a.length; res && i < len; i++) {
            // 需要类型转化的比较
            /* eslint-disable eqeqeq */
            res = a[i] == b[i];
            /* eslint-enable eqeqeq */
        }

        return res;
    }

    /**
     * 比较对象
     *
     * @inner
     * @param {Object} a 待比较对象
     * @param {Object} b 待比较对象
     * @return {boolean}
     */
    function compareObject(a, b) {

        if (!isObject(a) || !isObject(b)) {
            return false;
        }

        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) {
            return false;
        }

        var res = true;
        for (var i = 0, key, item; res && (key = aKeys[i]); i++) {
            if (!b.hasOwnProperty(key)) {
                res = false;
                break;
            }

            item = a[key];
            if (Array.isArray(item)) {
                res = compareArray(item, b[key]);
            }
            else {
                // 需要类型转化的比较
                /* eslint-disable eqeqeq */
                res = item == b[key];
                /* eslint-enable eqeqeq */
            }
        }

        return res;
    }

    /**
     * 解码数据
     *
     * @inner
     * @param {string|Array.<string>} value 数据
     * @return {string|Array.<string>}
     */
    function decodeValue(value) {
        if (Array.isArray(value)) {
            value = value.map(function (k) {
                return decodeURIComponent(k || '');
            });
        }
        else if (!value && !isString(value)) {
            value = null;
        }
        else {
            value = decodeURIComponent(value);
        }
        return value;
    }

    /**
     * 添加查询条件
     *
     * @inner
     * @param {string} key 键
     * @param {string|Array.<string>} value 值
     * @param {Object} items 目标数据
     * @return {Object}
     */
    function addQueryItem(key, value, items) {
        var item = items[key];

        value = decodeValue(value);

        if (item) {
            if (!Array.isArray(item)) {
                item = [item];
            }
            if (Array.isArray(value)) {
                item = item.concat(value);
            }
            else {
                item.push(value);
            }
        }
        else {
            item = value;
        }

        items[key] = item;

        return items;
    }

    /**
     * Query
     *
     * @constructor
     * @param {string|Object} data 查询条件
     */
    function Query(data) {
        data = data || {};
        Abstract.call(this, data);
    }

    inherits(Query, Abstract);

    /**
     * 设置query
     *
     * @public
     * @param {...string|Object} data 查询条件
     */
    Query.prototype.set = function () {

        if (arguments.length === 1) {
            var query = arguments[0];
            if (isObject(query)) {
                var data = this.data = {};
                Object.keys(query).forEach(function (key) {
                    data[key] = decodeValue(query[key]);
                });
            }
            else {
                this.data = parse(query);
            }
        }
        else {
            this.data[arguments[0]] = decodeValue(arguments[1]);
        }

    };

    /**
     * 获取query
     *
     * @public
     * @param {string=} name 查询条件名称
     * @return {*}
     */
    Query.prototype.get = function (name) {
        return name ? this.data[name] : extend({}, this.data);
    };

    /**
     * 字符串化
     *
     * @public
     * @param {string=} prefix 前缀分割符
     * @return {string}
     */
    Query.prototype.toString = function (prefix) {
        prefix = prefix || DEFAULT_PREFIX;
        var str = stringify(this.data);

        return str ? prefix + str : '';
    };

    /**
     * 比较query
     *
     * @public
     * @param {string|Object|Query} query 查询条件
     * @return {boolean}
     */
    Query.prototype.equal = function (query) {
        if (isString(query)) {
            query = parse(query);
        }
        else if (query instanceof Query) {
            query = query.get();
        }

        return compareObject(this.data, query);
    };

    /**
     * 添加query item
     *
     * @public
     * @param {string|Object} key 键
     * @param {string=} value 值
     */
    Query.prototype.add = function (key, value) {
        var data = this.data;

        if (isObject(key)) {
            Object.keys(key).forEach(function (k) {
                addQueryItem(k, key[k], data);
            });
        }
        else {
            addQueryItem(key, value, data);
        }

        this.data = data;
    };

    /**
     * 删除query item
     *
     * @public
     * @param {string=} key 键，忽略该参数则清除所有的query item
     */
    Query.prototype.remove = function (key) {
        if (!key) {
            this.data = {};
        }
        else if (this.data.hasOwnProperty(key)) {
            delete this.data[key];
        }
    };

    return Query;
});
;
/**
 * @file scheme component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/Scheme', ['require', 'sfr/router/lang/inherits', 'sfr/router/uri/component/Abstract'], function (require) {
    var inherits = require('sfr/router/lang/inherits');
    var Abstract = require('sfr/router/uri/component/Abstract');

    /**
     * Scheme
     *
     * @constructor
     * @param {string} data 协议
     */
    function Scheme(data) {
        Abstract.call(this, data);
    }

    inherits(Scheme, Abstract);

    /**
     * 设置scheme
     * 忽略大小写
     *
     * @public
     * @param {string} scheme 协议
     */
    Scheme.prototype.set = function (scheme) {
        scheme = scheme || '';
        this.data = scheme.toLowerCase();
    };

    /**
     * 比较scheme
     * 忽略大小写
     *
     * @public
     * @param {string|Scheme} scheme 协议
     * @return {boolean}
     */
    Scheme.prototype.equal = function (scheme) {
        if (scheme instanceof Scheme) {
            scheme = scheme.get();
        }
        else {
            scheme = scheme || '';
        }
        return this.data === scheme.toLowerCase();
    };

    return Scheme;
});
;
/**
 * @file username component
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/component/UserName', ['require', 'sfr/router/lang/inherits', 'sfr/router/uri/component/Abstract'], function (require) {
    var inherits = require('sfr/router/lang/inherits');
    var Abstract = require('sfr/router/uri/component/Abstract');

    /**
     * UserName
     *
     * @constructor
     * @param {string} data 用户名
     */
    function UserName(data) {
        Abstract.call(this, data);
    }

    inherits(UserName, Abstract);

    return UserName;
});
;
/**
 * @file parse query
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/util/parse-query', ['require'], function (require) {

    /**
     * 解析query
     *
     * @public
     * @param {string} query 查询条件
     * @return {Object}
     */
    function parse(query) {
        var res = {};

        query = query.split('&');
        var key;
        var value;
        query.forEach(function (item) {
            if (!item) {
                return;
            }

            item = item.split('=');
            key = item[0];
            value = item.length >= 2
                ? decodeURIComponent(item[1])
                : null;

            if (res[key]) {
                if (!Array.isArray(res[key])) {
                    res[key] = [res[key]];
                }
                res[key].push(value);
            }
            else {
                res[key] = value;
            }
        });

        return res;
    }

    return parse;

});
;
/**
 * @file stringify query
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/util/stringify-query', ['require'], function (require) {

    /**
     * 字符串化query
     *
     * @public
     * @param {Object} query 查询条件
     * @return {string}
     */
    function stringify(query) {
        var str = [];
        var item;

        Object.keys(query).forEach(function (key) {
            item = query[key];

            if (!Array.isArray(item)) {
                item = [item];
            }

            item.forEach(function (value) {
                if (value === null) {
                    str.push(key);
                }
                else {
                    str.push(key + '=' + encodeURIComponent(value || ''));
                }
            });
        });

        return str.join('&');
    }

    return stringify;
});
;
/**
 * @file uri parser
 * @author treelite(c.xinle@gmail.com)
 */

define('sfr/router/uri/util/uri-parser', ['require', 'sfr/router/lang/extend'], function (require) {

    var UNDEFINED;

    var extend = require('sfr/router/lang/extend');

    /**
     * 标准化URI数据
     *
     * @inner
     * @param {Object} data URI数据
     * @return {Object}
     */
    function normalize(data) {
        var res = {};
        // URI组成
        // http://tools.ietf.org/html/rfc3986#section-3
        var components = [
                'scheme', 'username', 'password', 'host',
                'port', 'path', 'query', 'fragment'
            ];

        components.forEach(function (name) {
            res[name] = data[name] || UNDEFINED;
        });

        return res;
    }

    /**
     * 解析authority
     * ! 不支持IPv6
     *
     * @inner
     * @param {string} str authority
     * @return {Object}
     */
    function parseAuthority(str) {
        var res = {};

        str.replace(
            /^([^@]+@)?([^:]+)(:\d+)?$/,
            function ($0, userInfo, host, port) {
                if (userInfo) {
                    userInfo = userInfo.slice(0, -1);
                    userInfo = userInfo.split(':');
                    res.username = userInfo[0];
                    res.password = userInfo[1];
                }

                res.host = host;

                if (port) {
                    res.port = port.substring(1);
                }
            }
        );

        return res;

    }

    /**
     * 检测是否有port
     *
     * @inner
     * @param {string} str uri字符串
     * @param {Object} data 数据容器
     * @return {boolean}
     */
    function detectPort(str, data) {
        // 忽略scheme 与 userinfo
        var res = /[^:]+:\d{2,}(\/|$)/.test(str);

        // 有port
        // 必定没有scheme
        if (res) {
            str = str.split('/');
            extend(data, parseAuthority(str.shift()));
            if (str.length > 0) {
                data.path = '/' + str.join('/');
            }
        }

        return res;
    }

    /**
     * 检测是否有scheme
     *
     * @inner
     * @param {string} str uri字符串
     * @param {Object} data 数据容器
     * @return {boolean}
     */
    function detectScheme(str, data) {
        var i = str.indexOf(':');
        var slashIndex = str.indexOf('/');
        slashIndex = slashIndex >= 0 ? slashIndex : str.length;

        // 不考虑authority
        var res = i >= 0 && i < slashIndex;

        if (res) {
            data.scheme = str.substring(0, i);
            data.path = str.substring(i + 1);
        }

        return res;
    }

    /**
     * 解析字符串
     *
     * @inner
     * @param {string} str uri字符串
     * @return {Object}
     */
    function parse(str) {
        var res = {};

        // 提取fragment
        var i = str.indexOf('#');
        if (i >= 0) {
            res.fragment = str.substring(i + 1);
            str = str.substring(0, i);
        }

        // 提取query
        i = str.indexOf('?');
        if (i >= 0) {
            res.query = str.substring(i + 1);
            str = str.substring(0, i);
        }

        // 检测是否同时有scheme与authority
        i = str.indexOf('://');
        if (i >= 0) {
            res.scheme = str.substring(0, i);
            str = str.substring(i + 3);
            // 特例 `file` 不存在 authority
            if (res.scheme === 'file') {
                res.path = str;
            }
            else {
                str = str.split('/');
                extend(res, parseAuthority(str.shift()));
                if (str.length > 0) {
                    res.path = '/' + str.join('/');
                }
            }
            return res;
        }

        // 检测是否含有port
        // 如果有必定不存在scheme
        if (detectPort(str, res)) {
            return res;
        }

        // 检测是否含有scheme
        // 如果有必定不存在authority
        if (detectScheme(str, res)) {
            return res;
        }

        // 只有host与path
        str = str.split('/');
        res.host = str.shift();
        if (str.length > 0) {
            res.path = '/' + str.join('/');
        }

        return res;
    }

    /**
     * 解析URI
     *
     * @public
     * @param {string|Object} data uri
     * @return {Object}
     */
    return function (data) {

        if (typeof data === 'string'
            || data instanceof String
        ) {
            data = parse(data);
        }

        return normalize(data);
    };

});
;

/*utils*/
define('sfr/utils/http', ['sfr/utils/promise', 'sfr/utils/underscore', 'sfr/utils/url'], function(Promise, _, Url) {
    var exports = {};

    /*
     * Perform an asynchronous HTTP (Ajax) request.
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} settings A set of key/value pairs that configure the Ajax request. All settings are optional.
     * @param {String} settings.method The method to open the Ajax request.
     * @param {Any} settings.data The data to send, could be a string, a FormData, or a plain object. The 'Content-type' header is guessed accordingly, ie. 'application/x-www-form-urlencoded', 'multipart/form-data'.
     * @param {Object} settings.headers A set of key/value pairs that configure the Ajax request headers. If set to 'application/json', the settings.data will be JSON.stringified; If set to 'x-www-form-urlencoded', which is by default, the settings.data will be url-encoded.
     * @param {Boolean} settings.jsonp [NOT implemented yet] Whether or not to use JSONP, default to `false`.
     * @param {String} settings.jsonpCallback [NOT implemented yet] Specify the callback function name for a JSONP request. This value will be used instead of the random name automatically generated by default.
     * @param {xhrFields} settings.xhrFields A set of key/value pairs that configure the fields of the xhr object. Note: onreadystatechange not supported, make use of the returned promise instead.
     * @return {Promise} A promise resolves/rejects with the xhr
     * @example
     * ajax('/foo', {
     *         method: 'POST',
     *         headers: {
     *             "content-type": "application/json"
     *         },
     *         xhrFields: {
     *             withCredentials: true
     *         }
     *     })
     *     .then(function(xhr) {
     *         xhr.status == 200;
     *         xhr.responseHeaders['Content-Type'] == 'application/json';
     *         xhr.responseText == '{"foo": "bar"}';
     *         // xhr.data is parsed from responseText according to Content-Type
     *         xhr.data === {foo: 'bar'};
     *     });
     *     .catch(function(xhr|errorThrown ) {});
     *     .finally(function(xhr|errorThrown ) { });
     */
    exports.ajax = function(url, settings) {
        //console.log('ajax with', url, settings);
        if (typeof url === 'object') {
            settings = url;
            url = "";
        }
        // normalize settings
        settings = _.defaultsDeep(settings, {
            url: url,
            method: settings && settings.type || 'GET',
            headers: {},
            data: null,
            jsonp: false,
            jsonpCallback: 'sf_http_' + Math.random().toString(36).substr(2)
        });
        _.forOwn(settings.headers, function(v, k) {
            settings.headers[k] = v.toLowerCase(v);
        });

        settings.headers['content-type'] = settings.headers['content-type'] ||
            _guessContentType(settings.data);

        //console.log('before parse data', settings);
        if (/application\/json/.test(settings.headers['content-type'])) {
            settings.data = JSON.stringify(settings.data);
        } else if (/form-urlencoded/.test(settings.headers['content-type'])) {
            settings.data = Url.param(settings.data);
        }
        //console.log('after parse data', settings);
        return _doAjax(settings);
    };

    /*
     * Try guess the content-type of given data.
     */
    function _guessContentType(data) {
        if (data instanceof FormData) {
            return 'multipart/form-data';
        }
        return 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    /*
     * Load data from the server using a HTTP GET request.
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} data A plain object or string that is sent to the server with the request.
     * @return {Promise} A promise resolves/rejects with the xhr
     */
    exports.get = function(url, data) {
        return exports.ajax(url, {
            data: data
        });
    };

    /*
     * Load data from the server using a HTTP POST request.
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} data A plain object or string that is sent to the server with the request.
     * @return {Promise} A promise resolves/rejects with the xhr
     */
    exports.post = function(url, data) {
        return exports.ajax(url, {
            method: 'POST',
            data: data
        });
    };

    /*
     * Load data from the server using a HTTP PUT request.
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} data A plain object or string that is sent to the server with the request.
     * @return {Promise} A promise resolves/rejects with the xhr
     */
    exports.put = function(url, data) {
        return exports.ajax(url, {
            method: 'PUT',
            data: data
        });
    };

    /*
     * Load data from the server using a HTTP DELETE request.
     * @param {String} url A string containing the URL to which the request is sent.
     * @param {Object} data A plain object or string that is sent to the server with the request.
     * @return {Promise} A promise resolves/rejects with the xhr
     */
    exports.delete = function(url, data) {
        return exports.ajax(url, {
            method: 'DELETE',
            data: data
        });
    };

    function _doAjax(settings) {
        //console.log('_doAjax with', settings);
        var xhr;
        try {
            xhr = _createXHR();
        } catch (e) {
            return Promise.reject(e);
        }
        //console.log('open xhr');
        xhr.open(settings.method, settings.url, true);

        _.forOwn(settings.headers, function(v, k) {
            xhr.setRequestHeader(k, v);
        });
        _.assign(xhr, settings.xhrFields);

        return new Promise(function(resolve, reject) {
            xhr.onreadystatechange = function() {
                //console.log('onreadystatechange', xhr.readyState, xhr.status);
                if (xhr.readyState == 4) {
                    xhr = _resolveXHR(xhr);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr);
                    } else {
                        reject(xhr);
                    }
                }
            };
            //console.log('doajax sending:', settings.data);
            xhr.send(settings.data);
        });
    }

    function _resolveXHR(xhr) {
        /*
         * parse response headers
         */
        var headers = xhr.getAllResponseHeaders()
            // Spec: https://developer.mozilla.org/en-US/docs/Glossary/CRLF
            .split('\r\n')
            .filter(_.negate(_.isEmpty))
            .map(function(str) {
                return _.split(str, /\s*:\s*/);
            });
        xhr.responseHeaders = _.fromPairs(headers);

        /*
         * parse response body
         */
        xhr.data = xhr.responseText;
        if (xhr.responseHeaders['Content-Type'] === 'application/json') {
            try {
                xhr.data = JSON.parse(xhr.responseText);
            } catch (e) {
                console.warn('Invalid JSON content with Content-Type: application/json');
            }
        }
        return xhr;
    }

    function _createXHR() {
        //console.log('create xhr');
        var xhr = false;

        if (window.XMLHttpRequest) { // Mozilla, Safari,...
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) { // IE
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
        if (!xhr) {
            throw 'Cannot create an XHR instance';
        }
        return xhr;
    }

    return exports;
});
;
define('sfr/utils/di', ['require'], function(require) {
    var container = {};
    var di = {
        container: container
    };

    /*
     * Register a service
     * TODO: implementation
     */
    di.service = function(name, impl) {};

    /*
     * Register a factory
     * TODO: implementation
     */
    di.factory = function(name, impl) {};

    /*
     * Register a provider
     * TODO: implementation
     */
    di.provider = function(name, impl) {};

    /**
     * Register a value
     *
     * @param {String} name
     * @param {mixed} val
     * @return {undefined}
     * @return {di}
     */
    di.value = function(name, val) {
        Object.defineProperty(container, name, {
            configurable: true,
            enumerable: true,
            value: val,
            writable: true
        });
        return di;
    };

    return di;
});
;
define('sfr/utils/url', ['sfr/utils/underscore'], function(_) {
    /*
     * Format a plain object into query string.
     * @static
     * @param {Object} obj The object to be formated.
     * @return {String} The result query string.
     * @example
     * param({foo:'bar ', bar: 'foo'});     // yields "foo=bar%20&bar=foo"
     */
    function param(obj) {
        if (!_.isObject(obj)) return obj;
        return _.map(obj, function(v, k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(v);
            })
            .join('&');
    }
    return {
        param: param
    };
});
;
/*
 * @author harttle(yangjvn@126.com)
 * @file 通用工具：包括字符串工具、对象工具、函数工具、语言增强等。
 *      设计原则：
 *          1. 与 Lodash 重合的功能与其保持接口一致，
 *             文档: https://github.com/exports/exports
 *          2. Lodash 中不包含的部分，如有需要可联系 yangjvn14 (Hi)
 *             文档：本文件中函数注释。
 */

define('sfr/utils/underscore', ['require'], function(require) {
    /*
     * 变量定义
     */
    var exports = {};
    var _arrayProto = Array.prototype;
    var _objectProto = Object.prototype;
    var _stringProto = String.prototype;

    /*
     * 私有函数
     */
    function _getArgs(args) {
        args = toArray(args);
        args.shift();
        return args;
    }

    /*
     * 公有函数
     */

    /*
     * Creates an array of the own and inherited enumerable property names of object.
     * @param {Object} object The object to query.
     * @return {Array} Returns the array of property names.
     */
    function keysIn(object) {
        return Object.keys(object);
    }

    /*
     * Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property. 
     * The iteratee is invoked with three arguments: (value, key, object). 
     * Iteratee functions may exit iteration early by explicitly returning false.
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @return {Object} Returs object.
     */
    function forOwn(object, iteratee) {
        object = object || {};
        for (var k in object) {
            if (object.hasOwnProperty(k)) {
                if (iteratee(object[k], k, object) === false) break;
            }
        }
        return object;
    }

    /*
     * Converts value to an array.
     * @param {any} value The value to convert.
     * @return {Array} Returns the converted array.
     */
    function toArray(value) {
        if (!value) return [];
        return _arrayProto.slice.call(value);
    }

    /*
     * Iterates over elements of collection and invokes iteratee for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @return {undefined} Just like Array.prototype.forEach
     */
    function forEach(collection, iteratee) {
        var args = _getArgs(arguments);
        return _arrayProto.forEach.apply(collection || [], args);
    }

    /*
     * Creates an array of values by running each element in collection thru iteratee.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @return {Array} Returns the new mapped array.
     */
    function map(collection, iteratee) {
        if (isObject(collection)) {
            var ret = [];
            forOwn(collection, function(v, k) {
                ret.push(iteratee.apply(null, arguments));
            });
            return ret;
        }
        var args = _getArgs(arguments);
        return _arrayProto.map.apply(collection || [], args);
    }

    /*
     * Creates a slice of array from start up to, but not including, end.
     * @param {Array} collection The array to slice.
     * @param {Number} start The start position.
     * @param {Number} end The end position.
     * @return {Array} Returns the slice of array.
     */
    function slice(collection, start, end) {
        var args = _getArgs(arguments);
        return _arrayProto.slice.apply(collection || [], args);
    }

    /*
     * This method is based on JavaScript Array.prototype.splice
     */
    function splice(collection) {
        var args = _getArgs(arguments);
        return _arrayProto.splice.apply(collection || [], args);
    }

    /*
     * This method is based on JavaScript String.prototype.split
     * @return {Array} Returns the string segments.
     */
    function split(str) {
        var args = _getArgs(arguments);
        return _stringProto.split.apply(str || '', args);
    }

    /*
     * The missing string formatting function for JavaScript.
     * @param {String} fmt The format string (can only contain "%s")
     * @return {String} The result string.
     * @example
     * format("foo%sfoo", "bar");   // returns "foobarfoo"
     */
    function format(fmt) {
        return _getArgs(arguments).reduce(function(prev, cur) {
            return prev.replace('%s', cur);
        }, fmt);
    }

    /*
     * Assigns own and inherited enumerable string keyed properties of source objects to 
     * the destination object for all destination properties that resolve to undefined. 
     * Source objects are applied from left to right. 
     * Once a property is set, additional values of the same property are ignored.
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @return {Object} Returns object.
     */
    function defaults() {
        return assign.apply(null, slice(arguments, 0).reverse());
    }

    /*
     * Checks if value is the language type of Object. 
     * (e.g. arrays, functions, objects, regexes, new Number(0), and new String(''))
     * @param {any} value The value to check.
     * @return {Boolean} Returns true if value is an object, else false.
     */
    function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    /*
     * Checks if value is classified as a String primitive or object.
     * @param {any} value The value to check.
     * @return {Boolean} Returns true if value is a string, else false.
     */
    function isString(value) {
        return value instanceof String || typeof value === 'string';
    }

    /*
     * Checks if value is classified as a RegExp object.
     * @param {any} value The value to check.
     * @return {Boolean} Returns true if value is a RegExp, else false.
     */
    function isRegExp(value) {
        return value instanceof RegExp;
    }

    /*
     * Assigns own enumerable string keyed properties of source objects to the destination object. 
     * Source objects are applied from left to right. 
     * Subsequent sources overwrite property assignments of previous sources.  
     *
     * Note: This method mutates object and is loosely based on Object.assign.
     *
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @return {Object} Returns object.
     */
    function assign(object, source) {
        object = object == null ? {} : object;
        var srcs = slice(arguments, 1);
        forEach(srcs, function(src) {
            _assignBinary(object, src);
        });
        return object;
    }

    function _assignBinaryDeep(dst, src) {
        if (!dst) return dst;
        forOwn(src, function(v, k) {
            if (isObject(v) && isObject(dst[k])) {
                return _assignBinaryDeep(dst[k], v);
            }
            dst[k] = v;
        });
    }

    function _assignBinary(dst, src) {
        if (!dst) return dst;
        forOwn(src, function(v, k) {
            dst[k] = v;
        });
        return dst;
    }

    /*
     * This method is like `_.defaults` except that it recursively assigns default properties.
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @return {Object} Returns object.
     */
    function defaultsDeep() {
        var ret = {};
        var srcs = slice(arguments, 0).reverse();
        forEach(srcs, function(src) {
            _assignBinaryDeep(ret, src);
        });
        return ret;
    }

    /*
     * The inverse of `_.toPairs`; this method returns an object composed from key-value pairs.
     * @param {Array} pairs The key-value pairs.
     * @return {Object} Returns the new object.
     */
    function fromPairs(pairs) {
        var object = {};
        map(pairs, function(arr) {
            var k = arr[0],
                v = arr[1];
            object[k] = v;
        });
        return object;
    }

    /*
     * Checks if value is classified as an Array object.
     * @param {any} value The value to check.
     * @return {Boolean} Returns true if value is an array, else false.
     */
    function isArray(value) {
        return value instanceof Array;
    }

    /*
     * Checks if value is an empty object, collection, map, or set.  
     * Objects are considered empty if they have no own enumerable string keyed properties.
     * @param {any} value The value to check.
     * @return {Boolean} Returns true if value is an array, else false.
     */
    function isEmpty(value) {
        return isArray(value) ? value.length === 0 : !value;
    }

    /*
     * Creates a function that negates the result of the predicate func.
     * The func predicate is invoked with the this binding and arguments of the created function.
     * @param {Function} predicate The predicate to negate.
     * @return {Function} Returns the new negated function.
     */
    function negate(predicate) {
        return function() {
            return !predicate.apply(null, arguments);
        };
    }

    /*
     * Creates a function that invokes func with partials prepended to the arguments it receives.
     * This method is like `_.bind` except it does not alter the this binding.
     * @param {Function} func  The function to partially apply arguments to.
     * @param {...any} partials The arguments to be partially applied.
     * @return {Function} Returns the new partially applied function.
     */
    function partial(func) {
        var placeholders = slice(arguments);
        return function() {
            var spliceArgs = [0, 0];
            spliceArgs.push(placeholders);
            var args = _arrayProto.splice.apply(arguments, spliceArgs);
            return func.apply(null, args);
        };
    }

    /*
     * This method is like `_.partial` except that partially applied arguments are appended to the arguments it receives.
     * @param {Function} func  The function to partially apply arguments to.
     * @param {...any} partials The arguments to be partially applied.
     * @return {Function} Returns the new partially applied function.
     */
    function partialRight(func) {
        var placeholders = slice(arguments);
        placeholders.shift();
        return function() {
            var args = slice(arguments);
            var spliceArgs = [args, arguments.length, 0].concat(placeholders);
            splice.apply(null, spliceArgs);
            return func.apply(null, args);
        };
    }

    /* 
     * objectect Related
     */
    exports.keysIn = keysIn;
    exports.forOwn = forOwn;
    exports.assign = assign;
    exports.merge = assign;
    exports.extend = assign;
    exports.defaults = defaults;
    exports.defaultsDeep = defaultsDeep;
    exports.fromPairs = fromPairs;

    /*
     * Array Related
     */
    exports.slice = slice;
    exports.splice = splice;
    exports.forEach = forEach;
    exports.map = map;
    exports.toArray = toArray;

    /*
     * String Related
     */
    exports.split = split;
    exports.format = format;

    /*
     * Lang Related
     */
    exports.isArray = isArray;
    exports.isEmpty = isEmpty;
    exports.isString = isString;
    exports.isObject = isObject;
    exports.isRegExp = isRegExp;

    /*
     * Function Related
     */
    exports.partial = partial;
    exports.partialRight = partialRight;
    exports.negate = negate;

    return exports;
});
;
define('sfr/utils/promise', ['require', 'sfr/utils/underscore'], function(require) {
    var _ = require('sfr/utils/underscore');
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var _config = {
        longStackTraces: false
    };

    /*
     * Create a new promise. 
     * The passed in function will receive functions resolve and reject as its arguments 
     * which can be called to seal the fate of the created promise.
     * 
     * The returned promise will be resolved when resolve is called, and rejected when reject called or any exception occurred.
     * If you pass a promise object to the resolve function, the created promise will follow the state of that promise.
     *
     * > This implementation conforms to Promise/A+ spec. see: https://promisesaplus.com/
     * @param {Function(function resolve, function reject)} cb The resolver callback.
     * @return {Promise} A thenable. 
     * @constructor
     * @example
     * var p = new Promise(function(resolve, reject){
     *     true ? resolve('foo') : reject('bar');
     * });
     */
    function Promise(cb) {
        if (!(this instanceof Promise)) {
            throw 'Promise must be called with new operator';
        }
        if (typeof cb !== 'function') {
            throw 'callback not defined';
        }

        this._state = PENDING;
        this._result;
        this._fulfilledCbs = [];
        this._rejectedCbs = [];

        // 标准：Promises/A+ 2.2.4, see https://promisesaplus.com/ 
        // In practice, this requirement ensures that 
        //   onFulfilled and onRejected execute asynchronously, 
        //   after the event loop turn in which then is called, 
        //   and with a fresh stack.
        var self = this;
        setTimeout(function() {
            self._doResolve(cb);
        });
    }

    Promise.prototype._fulfill = function(result) {
        //console.log('_fulfill', result);
        this._result = result;
        this._state = FULFILLED;
        this._flush();
    };

    Promise.prototype._reject = function(err) {
        //console.log('_reject', err);
        if(_config.longStackTraces && err){
            err.stack += '\n' + this._originalStack;
        }
        this._result = err;
        this._state = REJECTED;
        this._flush();
    };

    Promise.prototype._resolve = function(result) {
        //console.log('_resolve', result);
        if (_isThenable(result)) {
            // result.then is un-trusted
            this._doResolve(result.then.bind(result));
        } else {
            this._fulfill(result);
        }
    };

    /*
     * Resolve the un-trusted promise definition function: fn
     * which has exactly the same signature as the .then function
     */
    Promise.prototype._doResolve = function(fn) {
        // ensure resolve/reject called once
        var called = false;
        var self = this;
        try {
            fn(function(result) {
                if (called) return;
                called = true;
                self._resolve(result);
            }, function(err) {
                if (called) return;
                called = true;
                self._reject(err);
            });
        } catch (err) {
            if (called) return;
            called = true;
            self._reject(err);
        }
    };

    Promise.prototype._flush = function() {
        if (this._state === PENDING) {
            return;
        }
        var cbs = this._state === REJECTED ? this._rejectedCbs : this._fulfilledCbs;
        var self = this;
        cbs.forEach(function(callback) {
            if (typeof callback === 'function') {
                callback(self._result);
            }
        });
        this._rejectedCbs = [];
        this._fulfilledCbs = [];
    };

    /*
     * Register a callback on fulfilled or rejected.
     * @param {Function} onFulfilled the callback on fulfilled
     * @param {Function} onRejected the callback on rejected
     * @return {undefined}
     */
    Promise.prototype._done = function(onFulfilled, onRejected) {
        this._fulfilledCbs.push(onFulfilled);
        this._rejectedCbs.push(onRejected);
        this._flush();
    };

    /*
     * The Promise/A+ .then, register a callback on resolve. See: https://promisesaplus.com/
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
     */
    Promise.prototype.then = function(onFulfilled, onRejected) {
        var _this = this,
            ret;
        return new Promise(function(resolve, reject) {
            _this._done(function(result) {
                if (typeof onFulfilled === 'function') {
                    try {
                        ret = onFulfilled(result);
                    } catch (e) {
                        return reject(e);
                    }
                    resolve(ret);
                } else {
                    resolve(result);
                }
            }, function(err) {
                if (typeof onRejected === 'function') {
                    try {
                        ret = onRejected(err);
                    } catch (e) {
                        return reject(e);
                    }
                    resolve(ret);
                } else {
                    reject(err);
                }
            });
        });
    };

    /*
     * The Promise/A+ .catch, retister a callback on reject. See: https://promisesaplus.com/
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
     */
    Promise.prototype.catch = function(cb) {
        return this.then(function(result) {
            return result;
        }, cb);
    };

    /*
     * 
     * The Promise/A+ .catch, register a callback on either resolve or reject. See: https://promisesaplus.com/
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
     */
    Promise.prototype.finally = function(cb) {
        return this.then(cb, cb);
    };

    /*
     * Create a promise that is resolved with the given value. 
     * If value is already a thenable, it is returned as is. 
     * If value is not a thenable, a fulfilled Promise is returned with value as its fulfillment value.
     * @param {Promise<any>|any value} obj The value to be resolved.
     * @return {Promise} A thenable which resolves the given `obj`
     * @static
     */
    Promise.resolve = function(obj) {
        return _isThenable(obj) ? obj :
            new Promise(function(resolve) {
                return resolve(obj);
            });
    };
    /*
     * Create a promise that is rejected with the given error.
     * @param {Error} error The error to reject with.
     * @return {Promise} A thenable which is rejected with the given `error`
     * @static
     */
    Promise.reject = function(err) {
        return new Promise(function(resolve, reject) {
            reject(err);
        });
    };
    /*
     * This method is useful for when you want to wait for more than one promise to complete.
     *
     * Given an Iterable(arrays are Iterable), or a promise of an Iterable, 
     * which produces promises (or a mix of promises and values), 
     * iterate over all the values in the Iterable into an array and return a promise that is fulfilled when 
     * all the items in the array are fulfilled. 
     * The promise's fulfillment value is an array with fulfillment values at respective positions to the original array. 
     * If any promise in the array rejects, the returned promise is rejected with the rejection reason.
     * @param {Iterable<any>|Promise<Iterable<any>>} promises The promises to wait for.
     * @return {Promise} A thenable.
     * @static
     */
    Promise.all = function(promises) {
        return new Promise(function(resolve, reject) {
            var results = promises.map(function() {
                return undefined;
            });
            var count = 0;
            promises
                .map(Promise.resolve)
                .forEach(function(promise, idx) {
                    promise.then(function(result) {
                        results[idx] = result;
                        count++;
                        if (count === promises.length) {
                            resolve(results);
                        }
                    }, reject);
                });
        });
    };

    /*
     * Call functions in serial until someone rejected.
     * @param {Array} iterable the array to iterate with.
     * @param {Array} iteratee returns a new promise.
     * The iteratee is invoked with three arguments: (value, index, iterable). 
     */
    Promise.mapSeries = function(iterable, iteratee) {
        var ret = Promise.resolve('init');
        var result = [];
        iterable.forEach(function(item, idx) {
            ret = ret
                .then(function(){
                    return iteratee(item, idx, iterable);
                })
                .then(function(x){
                    return result.push(x);
                });
        });
        return ret.then(function(){
            return result;
        });
    }

    function _isThenable(obj) {
        return obj && typeof obj.then === 'function';
    }

    return Promise;
});
;
define('sfr/utils/assert', ['require'], function(require) {
    function assert(predict, msg){
        if(!predict){
            throw new Error(msg);
        }
    }
    return assert;
});

;
define('sfr/utils/map', ['require', 'sfr/utils/underscore'], function(require) {

	var _ = require('sfr/utils/underscore');

	/*
	 * Map Data Structure
	 * Types of keys supported: String, RegExp
	 */
	function Map() {
		this.size = 0;
		this._data = {};
	}

	/*
	 * set key into the map
	 * @param {String|RegExp} k the key
	 * @param {any} v the value
	 * @return {undefined}
	 */
	Map.prototype.set = function(k, v) {
		k = _fingerprint(k);
		if (!this._data.hasOwnProperty(k)) {
			this._data[k] = v;
			this.size++;
		}
	};

	/*
	 * test if the key exists
	 * @param {String|RegExp} k the key
	 * @param {any} v the value
	 * @return {Boolean} Returns true if contains k, return false otherwise.
	 */
	Map.prototype.has = function(k) {
		k = _fingerprint(k);
		return this._data.hasOwnProperty(k);
	};

	/*
	 * delete the specified key
	 * @param {String|RegExp} k the key
	 * @return {undefined}
	 */
	Map.prototype.delete = function(k) {
		k = _fingerprint(k);
		if (this._data.hasOwnProperty(k)) {
			delete this._data[k];
			this.size--;
		}
	};

	/*
	 * get value by key
	 * @param {String|RegExp} k the key
	 * @return {any} the value associated to k
	 */
	Map.prototype.get = function(k) {
		k = _fingerprint(k);
		return this._data[k];
	};

	/*
	 * clear the map, remove all keys
	 */
	Map.prototype.clear = function(k) {
		this.size = 0;
		this._data = {};
	};

	/*
	 * Get string fingerprint for value
	 * @param {any} value The value to be summarized.
	 * @return {String} The fingerprint for the value.
	 */
	function _fingerprint(value) {
		if (_.isRegExp(value)) {
			return 'reg_' + value;
		} else if (_.isString(value)) {
			return 'str_' + value;
		} else {
			return 'other_' + value;
		}
	}

	return Map;
});
;

/*action*/
define('sfr/action', ['require', 'sfr/router/router', 'sfr/utils/promise', 'sfr/utils/assert', 'sfr/utils/map', 'sfr/utils/underscore'], function(require) {

    var router = require('sfr/router/router');
    var Promise = require('sfr/utils/promise');
    var assert = require('sfr/utils/assert');
    var Map = require('sfr/utils/map');
    var _ = require('sfr/utils/underscore');
    var exports = {};
    var serviceMap = new Map();
    var indexUrl;
    var _backManually = false;

    /**
     *  Register a service instance to action
     *  @static
     *  @param {String|RestFul|RegExp} url The path of the service
     *  @param {Object} service The service object to be registered
     *  @return undefined
     *  @example
     *  action.regist('/person', new Service());
     *  action.regist('/person/:id', new Service());
     *  action.regist(/^person\/\d+/, new Service());
     * */
    exports.regist = function(url, service) {
        assert(url, 'illegal action url');
        assert(isService(service), 'illegal service, make sure to extend from sfr/service');
        assert(!serviceMap.has(url), 'path already registerd');
        router.add(url, this.dispatch);
        serviceMap.set(url, service);
    };

    /**
     *  Check if value is a valid service instance
     *  @param {any} value The value to check.
     *  @return {Boolean} Returns true if value is a service, else false.
     * */
    function isService(value) {
        // duck test...
        if(typeof value === 'object' 
                && value.create 
                && value.attach 
                && value.detach 
                && value.destroy 
                && value.update) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *  Switch from the previous service to the current one.
     *  Call prev.detach, prev.destroy, current.create, current.attach in serial.
     *
     *  If any of these callbacks returns a `Thenable`, it'll be await.
     *  If the promise is rejected, the latter callbacks will **NOT** be called.
     *
     *  Returns a promise that 
     *  resolves if all callbacks executed without throw (or reject),
     *  rejects if any of the callbacks throwed or rejected.
     *
     *  Note: If current and prev is the same service,
     *  the `prev.destroy` will **NOT** be called.
     *  @static
     *  @param {Object} current The current scope
     *  @param {Object} prev The previous scope
     *  @return {Promise}
     * */
    exports.dispatch = function(current, prev) {
        var proxyList = [];
        var currentService = serviceMap.get(current.pathPattern);
        var prevService = serviceMap.get(prev.pathPattern);

        current.options = current.options || {};
        if(_backManually){
            current.options.src = 'back';
            _backManually = false;
        }

        return Promise.mapSeries([
            prevService && prevService.detach.bind(prevService),
            currentService && currentService.create.bind(currentService),
            //container will not be destroyed
            prev.url !== indexUrl && prevService && prevService.destroy.bind(prevService),
            currentService && currentService.attach.bind(currentService)
        ], function(cb){
            if(typeof cb !== 'function') return;
            return cb(current, prev);
        }).catch(function(e){
            // throw asyncly rather than console.error(e.stack)
            // to enable browser console's error tracing.
            setTimeout(function(){
                throw e;
            });
        });
    };

    /**
     *  Remove a registered service
     *  @static
     *  @param {String} name The path of the service
     * */
    exports.remove = function(name) {
        return serviceMap.delete(name);
    };

    /**
     *  Check if the specified service has been registered
     *  @static
     *  @param {String} name The path of the service
     *  @return {Boolean} Returns true if it has been registered, else false.
     * */
    exports.exist = function(name) {
        return serviceMap.has(name);
    };

    /**
     *  Clear all registered service
     *  @static
     * */
    exports.clear = function(){
        serviceMap.clear();
        router.clear();
    };

    /**
     *  Redirect to another page, and change to next state
     *  @static
     *  @param {String} url The URL to redirect
     *  @param {String} query The query string to redirect
     *  @param {Object} options The router options to redirect
     * */
    exports.redirect = function(url, query, options) {
        router.redirect(url, query, options);
    };

    /**
     *  Back to last state
     *  @static
     * */
    exports.back = function() {
        _backManually = true;
        history.back(); 
    };

    /**
     *  Reset/replace current state
     *  @static
     *  @param {String} url The URL to reset
     *  @param {String} query The query string to reset
     *  @param {Object} options The router options to reset
     * */
    exports.reset = function(url, query, options) {
        router.reset(url, query, options);
    };


    /**
     *  hijack global link href
     *  @private
     *  @param {Event} e The click event object
     * */
    function _onAnchorClick(e, target) {
        //link href only support url like pathname,e.g:/sf?params=
        var link = target.getAttribute('data-sf-href');
        var options = target.getAttribute('data-sf-options');

        if(link) {
            try {
                options = JSON.parse(options) || {};
            } catch(err) {
                options = {};
            }
            options.src = "hijack";
            exports.redirect(link, null, options);

            e.preventDefault();
        }
    }

    function _delegateAnchorClick(cb){
        document.documentElement.addEventListener("click", function(event){
            event = event || window.event;
            var targetEl = _closest(event.target || event.srcElement, "A");
            if (targetEl) {
                cb(event, targetEl);
            }
        }, false);

        function _closest(element, tagName) {
            var parent = element;
            while (parent !== null && parent.tagName !== tagName.toUpperCase()) {
                parent = parent.parentNode;
            }
            return parent;
        }
    }

    /**
     *  Action init, call this to start the action
     *  @static 
     * */
    exports.start = function() {
        _delegateAnchorClick(_onAnchorClick);
    } ;

    /**
     *  Update page, reset or replace current state accordingly
     *  @static
     *  @param {String} url The URL to update
     *  @param {String} query The query string to update
     *  @param {Object} options The router options to update
     *  @param {Object} extend The extended data to update, contains a `container` and `view`
     * */
    exports.update = function(url, query, options, extend) {
        
        options = options ? options : {};
        
        //use silent mode
        if(!options.hasOwnProperty('silent')) {
            options.silent = true;
        }

        var prevUrl = location.href.replace(/.*\/([^/]+$)/,'/$1');

        var name = location.pathname.replace(/.*\/([^/]+$)/,'/$1');

        if(serviceMap.has(name)) {
            var service = serviceMap.get(name);
            service.update({
                path: name,
                url: url,
                prevUrl: prevUrl,
                query: query,
                options: options,
                container: extend.container,
                view: extend.view
            });
        }
        
        router.reset(url, query, options);
    };
    
    return exports;
});
;
/*
 * service base class
 * service base lifecycle
 * create by taoqingqian01
 */

define('sfr/service', ['require'], function(require) {

    var service = function() {};
    
    /*
     * Called when service created
     * @example
     * function(){
     *     // do initialization here
     *     this.onClick = function(){};
     * }
     */
    service.prototype.create = function() {};
    /*
     * Called when service attached
     * @example
     * function(){
     *     // do stuff on global click
     *     $(window).on('click', this.onClick);
     * }
     */
    service.prototype.attach = function() {};
    /*
     * Called when service dettached
     * @example
     * function(){
     *     // remove global listeners
     *     $(window).off('click', this.onClick);
     * }
     */
    service.prototype.detach = function() {};

    /*
     * Called when service destroy requested
     * @example
     * function(){
     *     this.onClick = null;
     * }
     */
    service.prototype.destroy = function() {};

    /*
     * Called when service update requested
     * @example
     * function(){
     *     // you may want to redraw your layout
     *     var rect = calcLayoutRect();
     *     this.redraw(rect);
     * }
     */
    service.prototype.update = function() {};
    
    return service;
});
;

/*resource*/
define('sfr/resource', ['sfr/utils/http', 'sfr/utils/underscore'], function(http, _) {
    function Resource(url) {
        this.url = url;
    }
    Resource.prototype = {
        /*
         * Get the URL for the given optionsions
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {String} A string of URL.
         */
        getUrl: function(options){
            var url = this.url;
            // replace slugs with properties
            _.forOwn(options, function(v, k) {
                url = url.replace(':' + k, v);
            });
            // remove remaining slugs
            url = url.replace(/:\w+/g, '');
            return url;
        },
        /*
         * Create an Object from `obj` with the given `options`.
         * @param {Object} obj A plain Object to be created on the server.
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is created successful, 
         * and rejects whenever there is an error.
         */
        create: function(obj, options) {
            var url = this.getUrl(options);
            return http.post(url, obj);
        },
        /*
         * Query Objects with the given `options`.
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when retrieved successful, 
         * and rejects whenever there is an error.
         */
        query: function(options) {
            var url = this.getUrl(options);
            return http.get(url);
        },
        /*
         * Update the object specified by `obj` with the given `options`.
         * @param {Object} obj A plain object to update with.
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is updated successful, 
         * and rejects whenever there is an error.
         */
        update: function(obj, options) {
            var url = this.getUrl(options);
            return http.put(url, obj);
        },
        /*
         * Delete objects with the given `options`.
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is deleted successful, 
         * and rejects whenever there is an error.
         */
        delete: function(options) {
            var url = this.getUrl(options);
            return http.delete(url);
        },
    };
    return Resource;
});
;

/*view*/
define('sfr/view', ['require'], function(require) {

    /*
     * Create a new view instance
     * @constructor
     */
    var View = function () {
        this._init();
    };

    View.prototype = {

        _init: function() {},

        /**
         * Initialize properties
         * */
        set: function() {},
        
        /*
         * Get properties
         */
        get: function() {},

        /*
         * Called when view created
         */
        create: function() {},

        /**
         *  Render the DOM, called when render requested. Override this to render your HTML
         * */
        render: function() {},

        /**
         *  Update the view, called when update requested. Override this to update or re-render your HTML.
         * */
        update : function() {},

        /*
         * Callback when view attached to DOM
         */
        attach: function() {},

        /*
         * Callback when view detached from DOM
         */
        detach : function() {},

        /**
         * Destroy the view, called when destroy requested.
         * */
        destroy: function() {},

        /**
         * Bind an event to the view.
         * @param {String} name The name of the event
         * @param {Function} callback The callback when the event triggered
         * */
        on: function(name, callback) {},

        /**
         * Unbind the given event
         * @param {String} name The event name to unbind
         * */
        off: function(name) {}
    };

    return View;
});
;

! function() {

    var deps = [{
        name: 'action',
        mid: 'sfr/action'
    }, {
        name: 'router',
        mid: 'sfr/router/router'
    }, {
        name: 'view',
        mid: 'sfr/view'
    }, {
        name: 'service',
        mid: 'sfr/service'
    }, {
        name: 'resource',
        mid: 'sfr/resource'
    }, {
        name: 'http',
        mid: 'sfr/utils/http'
    }, {
        name: 'promise',
        mid: 'sfr/utils/promise'
    }];

    var midList = deps.map(function(item) {
        return item.mid;
    });
    midList.push('sfr/utils/di');

    define('sfr', midList, function() {
        var di = require('sfr/utils/di');

        deps.forEach(function(item) {
            di.value(item.name, require(item.mid));
        });

        return di.container;
    });

}();
