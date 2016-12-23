/**
 * The common LRU cache
 *
 * Performance Notes: Since LRU queue is implemented by JavaScript Array internally,
 * it's enough for small cache limits. 
 * Large cache limits may require linklist implementation.
 * */
define(function() {

    var _ = require('../lang/underscore');

    var assert = require('../lang/assert');

    var exports = {};

    var _storage = {};

    /*
     * Create a LRU cache namespace.
     * @name Namespace
     * @param {String} name The namespace identifier
     * @param {Number} options.limit The MAX count of cached items
     * @param {Function(val, key)} options.onRemove The callback when item removed
     */
    function Namespace(name, options) {
        this.name = name;
        this.list = [];
        this.options = _.assign({
            limit: 3,
            onRemove: function() {}
        }, options);
    }
    Namespace.prototype = {
        /**
         * Get a cache item, and reset the item accessed to the tail.
         * @class Namespace 
         * @param {String} key The key for your cache item
         * @return {any} The value for your cache item, or undefined if the specified item does not exist.
         * */
        get: function(key) {
            var idx = this._findIndexByKey(key);
            if(idx === -1) return undefined;

            var item = this.list[idx];
            this.list.splice(idx, 1);
            this.list.push(item);
            return item.value;
        },
        /**
         * Set a cache item and put the item to the tail, while remove the first item when limit overflow.
         * @class Namespace 
         * @param {String} key The key for your cache item
         * @param {any} value The value for your cache item
         * */
        set: function(key, value) {
            this.remove(key);

            if (this.list.length === this.options.limit) {
                var dropped = this.list.shift();
                this.options.onRemove(dropped.value, dropped.key);
            }
            this.list.push({
                key: key,
                value: value
            });
            return this;
        },
        /*
         * Check whether the given key exists within the namespace, or whether the namespace exists if key not set.
         * @class Namespace 
         * @param {String} key The key to check with
         */
        contains: function(key) {
            return this._findIndexByKey(key) > -1;
        },
        /**
         * Rename a cache item
         * @class Namespace 
         * @param {String} before The source key for your cache item
         * @param {String} after The destination key for your cache item
         */
        rename: function(before, after) {
            if (before === after) {
                return this;
            }
            this.remove(after);
            var idx = this._findIndexByKey(before);
            if (idx == -1) {
                throw new Error('key not found:' + before);
            }
            this.list[idx].key = after;
            return this;
        },
        /**
         *  Remove a specific `key` in namespace `name`
         *  @class Namespace 
         *  @param {String} key The key to remove
         * */
        remove: function(key) {
            var idx = this._findIndexByKey(key);
            if (idx > -1) {
                var item = this.list[idx];
                this.options.onRemove(item.value, item.key);
                this.list.splice(idx, 1);
            }
            return this;
        },
        /*
         * Clear the given namespace, or all namespaces if `name` not set.
         * @class Namespace 
         * @param {String} name The namespace to clear.
         * @return {undefined}
         * */
        clear: function() {
            this.list = [];
            return this;
        },
        /**
         *  Find the index of the given key exists in list,
         *  @return {Number} return the index of the given key, false if not found
         *  @example
         *  findIndexByKey('k', [{'k':'v'}])    // yields 0
         * */
        _findIndexByKey: function(key) {
            return _.findIndex(this.list, function(item) {
                return item.key === key;
            });
        }
    };

    /*
     * Create a namespace
     * @static
     * @param {String} name The namespace identifier
     * @param {Object} options The options object used to create the namespace
     */
    exports.create = function(name, options) {
        assert(name, 'cannot create namespace with empty name');
        assert(!_storage[name], 'namespace with ' + name + ' already created');

        return _storage[name] = new Namespace(name, options);
    };

    /*
     * Using a specific namespace
     * @param {String} name The namespace identifier
     * @static
     * @return {Object} The scoped cache object
     */
    exports.using = function(name) {
        return usingNamespace(name);
    };

    /**
     * Set a cache item
     * @static
     * @param {String} name The namespace for your cache item
     * @param {String} key The key for your cache item
     * @param {any} value The value for your cache item
     * */
    exports.set = function(name, key, value) {
        return usingNamespace(name).set(key, value);
    };

    /**
     *  Get a cache item
     * @static
     * @param {String} name The namespace for your cache item
     * @param {String} key The key for your cache item
     * @return {any} The value for your cache item, or undefined if the specified item does not exist.
     * */
    exports.get = function(name, key) {
        return usingNamespace(name).get(key);
    };

    /**
     * Rename a cache item
     * @static
     * @param {String} name The namespace for your cache item
     * @param {String} before The source key for your cache item
     * @param {String} after The destination key for your cache item
     */
    exports.rename = function(name, before, after) {
        return usingNamespace(name).rename(before, after);
    };

    /**
     * Remove a specific `key` in namespace `name`
     * @static
     * @param {String} name The namespace identifier
     * @param {String} key The key to remove
     * */
    exports.remove = function(name, key) {
        return usingNamespace(name).remove(key);
    };

    /*
     * Clear the given namespace, or all namespaces if `name` not set.
     * @static
     * @param {String} name The namespace to clear.
     * @return {undefined}
     * */
    exports.clear = function(name) {
        if (arguments.length === 0) {
            _storage = {};
        } else {
            return usingNamespace(name).clear();
        }
    };

    /*
     * Check whether the given key exists within the namespace, or whether the namespace exists if key not set.
     * @static
     * @param {String} name The namespace to check
     * @param {String} key The key to check with
     */
    exports.contains = function(name, key) {
        if (arguments.length === 0) {
            throw new Error('namespace not specified');
        }
        // quering for namespace
        if (arguments.length === 1) {
            return _storage.hasOwnProperty(name);
        }
        // quering for key
        if (!_storage.hasOwnProperty(name)) {
            return false;
        }
        return _storage[name].contains(key);
    };

    /*
     *
     * Get the cache storage for specified namespace
     * @param {String} name The namespace to get
     * @private
     */
    function usingNamespace(name) {
        if (!_storage.hasOwnProperty(name)) {
            throw new Error('cache namespace ' + name + ' undefined');
        }
        return _storage[name];
    }

    return exports;

});
