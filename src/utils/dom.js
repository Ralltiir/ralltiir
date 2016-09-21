/*
 * @author harttle(yangjvn@126.com)
 * @file dom DOM, BOM工具集
 *      设计原则：
 *          1. 与jQuery兼容
 */
define(['./underscore'], function(_) {
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
