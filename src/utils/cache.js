/**
 *  cache模块，帮助框架进行部分模块的实例cache
 * */
define(function() {
    
    var exports = {};

    var DEFAULT_CACHE_NUM = 3;

    var _storage = {};


    exports.create = function(name, options) {
        if(!_storage[name]) {
            _storage[name] = {
                list: [],
                CACHE_NUM: options && options.CACHE_NUM ? options.CACHE_NUM : DEFAULT_CACHE_NUM
            };
        }
        return {
            get: exports.get.bind(this, name),
            set: exports.set.bind(this, name),
            rename: exports.rename.bind(this, name),
            remove: exports.remove.bind(this, name)
        };
    };

    /**
     *  判断数组中是否存在key，list格式:[{key:value}]
     * */
    function contains(key, list) {
        if(typeof list === 'object') {
            for(var i in list) {
                if(list[i].key === key) {
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
        if(!_storage.hasOwnProperty(name)) {
            //创建cache才能进行set
            return false;
        } else {
            var cache = _storage[name];
            var list = cache.list;

            //数组中已存在相同key的实例，并在下一个逻辑更新到队列最新位置
            var index = contains(key, list);
            if(typeof index === 'string') {
                list.splice(index, 1);
            }

            //cache buffer满足，直接写入
            if(cache.CACHE_NUM > list.length) {
                list.push({
                    key: key,
                    value: value
                });
            } else {//cache buffer不足，出栈最后一个，再写入
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
        if(!_storage.hasOwnProperty(name)) {
            return false;
        } else {
            var cache = _storage[name];
            var list = cache.list;
            var index = contains(key, list);
            return typeof index === 'string' && list[index].value;
        }
    };

    exports.rename = function (name, before, after) {
        if (!_storage.hasOwnProperty(name)) {
            return false;
        }
        var cache = _storage[name];
        var list = cache.list;
        var index = contains(before, list);
        if (typeof index === 'string') {
            var indexOldAfter = contains(after, list);
            if (typeof indexOldAfter === 'string') {
                list.splice(indexOldAfter, 1);
            }
            list[index].key = after;
        }
    };

    /**
     *  清除cache
     * */
    exports.remove = function(name, key) {
        var cache = _storage[name];
        if(!cache) {
            return false;
        }
        var list = cache.list;
        var index = contains(key, list);
        if(typeof index === 'string') {
            list.splice(index, 1);
            return true;
        }
        return false;
    };

    exports.clear = function(){
        _storage = {};
    };
    
    return exports;

});
