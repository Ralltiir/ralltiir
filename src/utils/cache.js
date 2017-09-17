/**
 * @file cache.js A simple LRU cache implementation.
 *
 * Performance Notes: Since LRU queue is implemented by JavaScript Array internally,
 * it's enough for small cache limits.
 * Large cache limits may require linklist implementation.
 * @author harttle<yangjun14@baidu.com>
 * @module Cache
 */

define(function (require) {
    var assert = require('../lang/assert');
    var Namespace = require('./cache-namespace');
    var storage = {};
    var exports = {};

    /**
     * Create a namespaced cache instance
     *
     * @static
     * @param {string} name The namespace identifier
     * @param {Object} options The options object used to create the namespace
     * @return {Namespace} the namespace object created
     */
    exports.create = function (name, options) {
        assert(name, 'cannot create namespace with empty name');
        assert(!storage[name], 'namespace with ' + name + ' already created');

        return storage[name] = new Namespace(name, options);
    };

    exports.destroy = function (name) {
        assert(storage[name], 'namespace with ' + name + ' not exist');
        delete storage[name];
    };

    /**
     * Using a specific namespace
     *
     * @param {string} name The namespace identifier
     * @static
     * @return {Object} The scoped cache object
     */
    exports.using = function (name) {
        return usingNamespace(name);
    };

    /**
     * Set a cache item
     *
     * @static
     * @param {string} name The namespace for your cache item
     * @param {string} key The key for your cache item
     * @param {any} value The value for your cache item
     * @return {any} The return value of corresponding Namespace#set
     * */
    exports.set = function (name, key, value) {
        return usingNamespace(name).set(key, value);
    };

    /**
     *  Get a cache item
     *
     * @static
     * @param {string} name The namespace for your cache item
     * @param {string} key The key for your cache item
     * @return {any} The value for your cache item, or undefined if the specified item does not exist.
     * */
    exports.get = function (name, key) {
        return usingNamespace(name).get(key);
    };

    exports.size = function (name) {
        return usingNamespace(name).size();
    };

    /**
     * Rename a cache item
     *
     * @static
     * @param {string} name The namespace for your cache item
     * @param {string} before The source key for your cache item
     * @param {string} after The destination key for your cache item
     * @return {any} The return value of corresponding Namespace#rename
     */
    exports.rename = function (name, before, after) {
        return usingNamespace(name).rename(before, after);
    };

    /**
     * Remove a specific `key` in namespace `name`
     *
     * @static
     * @param {string} name The namespace identifier
     * @param {string} key The key to remove
     * @return {any} The return value of corresponding Namespace#remove
     * */
    exports.remove = function (name, key) {
        return usingNamespace(name).remove(key);
    };

    /**
     * Clear the given namespace, or all namespaces if `name` not set.
     *
     * @static
     * @param {string} name The namespace to clear.
     * @return {undefined|Namespace} Return the Namespace object if `name` is given, undefined otherwise.
     * */
    exports.clear = function (name) {
        if (arguments.length === 0) {
            storage = {};
        }
        else {
            return usingNamespace(name).clear();
        }
    };

    /**
     * Check whether the given key exists within the namespace, or whether the namespace exists if key not set.
     *
     * @static
     * @param {string} name The namespace to check
     * @param {string} key The key to check with
     * @return {boolean} Return if the namespace specified by `name` contains `key`
     */
    exports.contains = function (name, key) {
        if (arguments.length === 0) {
            throw new Error('namespace not specified');
        }

        // quering for namespace
        if (arguments.length === 1) {
            return storage.hasOwnProperty(name);
        }

        // quering for key
        if (!storage.hasOwnProperty(name)) {
            return false;
        }

        return storage[name].contains(key);
    };

    exports.has = function (name) {
        return storage.hasOwnProperty(name);
    };

    /**
     * Get the cache storage for specified namespace
     *
     * @private
     * @param {string} name The namespace to get
     * @return {Namespace} Return the namespace object identified by `name`
     */
    function usingNamespace(name) {
        if (!storage.hasOwnProperty(name)) {
            throw new Error('cache namespace ' + name + ' undefined');
        }

        return storage[name];
    }

    return exports;

});
