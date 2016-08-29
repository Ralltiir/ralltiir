/**
 *  cache模块，帮助框架进行部分模块的实例cache
 * */
define(function() {

    var exports = {};

    var DEFAULT_CACHE_NUM = 3;

    var storage = {};

    function _normalize(options) {
        options = options || {};
        options.CACHE_NUM = options.CACHE_NUM || DEFAULT_CACHE_NUM;
        return options;
    }

    /*
     * 创建名为 name 的缓存序列
     */
    exports.create = function(name, options) {
        options = _normalize(options);

        if (!storage[name]) {
            storage[name] = {
                list: [],
                CACHE_NUM: options.CACHE_NUM
            };
        }
        return storage[name];
    };

    /**
     *  判断数组中是否存在key，list格式:[{key:value}]
     *  @return list 中的键值
     * */
    function contains(key, list) {
        if (typeof list === 'object') {
            for (var i in list) {
                if (list[i].key === key) {
                    return i;
                }
            }
        }
        return false;
    }

    /**
     *  写入cache
     * */
    exports.set = function(name, key, value) {
        if (!storage.hasOwnProperty(name)) {
            //创建cache才能进行set
            return false;
        } else {
            var cache = storage[name];
            var list = cache.list;

            //数组中已存在相同key的实例，并在下一个逻辑更新到队列最新位置
            var index = contains(key, list);
            if (typeof index === 'string') {
                list.splice(index, 1);
            }

            //cache buffer满足，直接写入
            if (cache.CACHE_NUM > list.length) {
                list.push({
                    key: key,
                    value: value
                });
            } else { //cache buffer不足，出栈最后一个，再写入
                var droped = list.shift().value;
                droped && droped.destroy && droped.destroy();
                list.push({
                    key: key,
                    value: value
                });
            }
        }
    };

    /**
     *  取cache
     * */
    exports.get = function(name, key) {
        if (!storage.hasOwnProperty(name)) {
            return false;
        } else {
            var cache = storage[name];
            var list = cache.list;
            var index = contains(key, list);
            return typeof index === 'string' && list[index].value;
        }
    };

    /**
     *  清除cache
     * */
    exports.remove = function(name, key) {
        var cache = storage[name];
        if (!cache) {
            return false;
        }
        var list = cache.list;
        var index = contains(key, list);
        if (typeof index === 'string') {
            list.splice(index, 1);
            return true;
        }
        return false;
    };

    /*
     *  清除所有Cache
     */
    exports.clear = function(name) {
        delete storage[name];
    };

    return exports;

});
