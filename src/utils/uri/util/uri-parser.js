/**
 * @file uri parser
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var UNDEFINED;

    var _ = require('../../../lang/underscore');

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
            _.extend(data, parseAuthority(str.shift()));
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
                _.extend(res, parseAuthority(str.shift()));
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
        if (_.isString(data)) {
            data = parse(data);
        }

        return normalize(data);
    };

});
