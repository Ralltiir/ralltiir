/*
 * @author harttle(yangjvn@126.com)
 * @file dom DOM, BOM工具集
 *      设计原则：
 *          1. 与jQuery兼容
 */
define(['./underscore'], function(_) {
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
