/**
 * @file query component
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var _ = require('../../../lang/underscore');
    var Abstract = require('./Abstract');
    var parse = require('../util/parse-query');
    var stringify = require('../util/stringify-query');

    /**
     * 默认的查询条件分割符
     *
     * @const
     * @type {string}
     */
    var DEFAULT_PREFIX = '?';

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

        if (!_.isObject(a) || !_.isObject(b)) {
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
                return decodeComponent(k);
            });
        }
        else if (value === null || value === undefined) {
            value = null;
        }
        else {
            value = decodeComponent(value);
        }
        return value;
    }

    function decodeComponent(value) {
        value = String(value).replace(/\+/g, '%20');
        return decodeURIComponent(value);
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

    _.inherits(Query, Abstract);

    /**
     * 设置query
     *
     * @public
     * @param {...string|Object} data 查询条件
     */
    Query.prototype.set = function () {

        if (arguments.length === 1) {
            var query = arguments[0];
            if (_.isObject(query)) {
                var data = this.data = {};
                _.forOwn(query, function (val, key) {
                    data[key] = decodeValue(val);
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
        return name ? this.data[name] : _.extend({}, this.data);
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
        if (_.isString(query)) {
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

        if (_.isObject(key)) {
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
