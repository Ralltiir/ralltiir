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
