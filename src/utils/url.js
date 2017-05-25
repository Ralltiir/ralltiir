/**
 * @file URL url parse utility
 * @author treelite(c.xinle@gmail.com)
 * @module url
 */

define(function (require) {

    var URI = require('./uri/URI');
    var _ = require('../lang/underscore');
    var Path = require('./uri/component/Path');
    var uRIParser = require('./uri/util/uri-parser');

    /**
     * 创建URI对象
     *
     * @constructor
     * @alias module:url
     * @param {...string|Object} data uri
     * @return {Object}
     */
    function url(data) {
        return new URI(data);
    }

    /**
     * 解析URI字符串
     *
     * @static
     * @param {string} str URI字符串
     * @return {Object} The URL Object
     */
    url.parse = function (str) {
        return uRIParser(str);
    };

    /**
     * resolve path
     *
     * @static
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    url.resolve = function (from, to) {
        return Path.resolve(from, to);
    };

    /**
     * Format a plain object into query string.
     *
     * @static
     * @param {Object} obj The object to be formated.
     * @return {string} The result query string.
     * @example
     * param({foo:'bar ', bar: 'foo'});     // yields "foo=bar%20&bar=foo"
     */
    url.param = function (obj) {
        if (!_.isObject(obj)) {
            return obj;
        }

        return _.map(obj, function (v, k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(v);
        })
            .join('&');
    };

    return url;
});
