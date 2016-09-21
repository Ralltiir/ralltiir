/*
 * @author harttle(yangjvn@126.com)
 * @file 通用工具：包括字符串工具、对象工具、函数工具、语言增强等。
 *      设计原则：
 *          1. 与 Lodash 重合的功能与其保持接口一致，
 *             文档: https://github.com/exports/exports
 *          2. Lodash 中不包含的部分，如有需要可联系 yangjvn14 (Hi)
 *             文档：本文件中函数注释。
 */

define(function() {
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
    function keysIn(obj) {
        return Object.keys(obj);
    }

    function forOwn(obj, cb) {
        obj = obj || {};
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                cb(obj[k], k);
            }
        }
        return obj;
    }

    function toArray(obj) {
        if (!obj) return [];
        return _arrayProto.slice.call(obj);
    }

    function forEach(arr) {
        var args = _getArgs(arguments);
        return _arrayProto.forEach.apply(arr || [], args);
    }

    function map(arr, cb) {
        if(isObject(arr)){
            var ret = [];
            forOwn(arr, function(v, k){
                ret.push(cb.apply(null, arguments));
            });
            return ret;
        }
        var args = _getArgs(arguments);
        return _arrayProto.map.apply(arr || [], args);
    }

    function slice(arr) {
        var args = _getArgs(arguments);
        return _arrayProto.slice.apply(arr || [], args);
    }

    function splice(arr) {
        var args = _getArgs(arguments);
        return _arrayProto.splice.apply(arr || [], args);
    }

    function split(str) {
        var args = _getArgs(arguments);
        return _stringProto.split.apply(str || '', args);
    }

    function format(fmt) {
        return _getArgs(arguments).reduce(function(prev, cur) {
            return prev.replace('%s', cur);
        }, fmt);
    }

    function defaults() {
        var ret = {};
        var srcs = slice(arguments, 0);
        forEach(srcs, function(src) {
            forOwn(src, function(v, k) {
                if (!ret.hasOwnProperty(k)) {
                    ret[k] = v;
                }
            });
        });
        return ret;
    }

    function isObject(obj){
        return obj !== null && typeof obj === 'object';
    }

    function isString(obj){
        return obj instanceof String || typeof obj === 'string';
    }

    function _assignBinaryDeep(dst, src){
        if(!dst) return dst;
        forOwn(src, function(v, k){
            if(isObject(v) && isObject(dst[k])){
                return _assignBinaryDeep(dst[k], v);
            }
            dst[k] = v;
        });
    }

    function _assignBinary(dst, src){
        if(!dst) return dst;
        forOwn(src, function(v, k){
            dst[k] = v;
        });
        return dst;
    }

    function defaultsDeep(){
        var ret = {};
        var srcs = slice(arguments, 0).reverse();
        forEach(srcs, function(src) {
            _assignBinaryDeep(ret, src);
        });
        return ret;
    }

    function fromPairs(propertyArr) {
        var obj = {};
        map(propertyArr, function(arr) {
            var k = arr[0],
                v = arr[1];
            obj[k] = v;
        });
        return obj;
    }

    function isArray(obj) {
        return obj instanceof Array;
    }

    function isEmpty(obj) {
        return isArray(obj) ? obj.length === 0 : !obj;
    }

    function negate(func) {
        return function() {
            return !func.apply(null, arguments);
        };
    }

    function partial(func) {
        var placeholders = slice(arguments);
        return function() {
            var spliceArgs = [0, 0];
            spliceArgs.push(placeholders);
            var args = _arrayProto.splice.apply(arguments, spliceArgs);
            return func.apply(null, args);
        };
    }

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
     * Object Related
     */
    exports.keysIn = keysIn;
    exports.forOwn = forOwn;
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

    /*
     * Function Related
     */
    exports.partial = partial;
    exports.partialRight = partialRight;
    exports.negate = negate;

    return exports;
});
