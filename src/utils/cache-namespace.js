/**
 * @file cache-namespace.js
 * @author harttle<yangjun14@baidu.com>
 */

define(function (require) {
    /**
     * Namespace utility for cache module
     * @module Namespace
     */

    var _ = require('../lang/underscore');

    /**
     * Event handler interfact used by Namespaceoptions.onRemove
     *
     * @interface
     * @param {string} v value
     * @param {string} k key
     * @param {boolean} evicted true if the entry is removed to make space, false otherwise
     */
    function onRemove(v, k, evicted) {
    }

    /**
     * Create a LRU cache namespace.
     *
     * @constructor
     * @alias module:Namespace
     * @param {string} name The namespace identifier
     * @param {number} options.limit The MAX count of cached items
     * @param {Function} options.onRemove The callback when item removed
     */
    function Namespace(name, options) {
        this.name = name;
        this.list = [];
        this.options = _.assign({
            limit: 3,
            onRemove: onRemove
        }, options);
    }
    Namespace.prototype = {
        constructor: Namespace,

        setLimit: function (limit) {
            this.options.limit = limit;
        },

        /**
         * Get a cache item, and reset the item accessed to the tail.
         *
         * @memberof Namespace
         * @param {string} key The key for your cache item
         * @return {any} The value for your cache item, or undefined if the specified item does not exist.
         */
        get: function (key) {
            var idx = this.findIndexByKey(key);
            if (idx === -1) {
                return undefined;
            }

            var item = this.list[idx];
            this.list.splice(idx, 1);
            this.list.push(item);
            return item.value;
        },

        /**
         * Set a cache item and put the item to the tail, while remove the first item when limit overflow.
         *
         * @param {string} key The key for your cache item
         * @param {any} value The value for your cache item
         * @return {Object} this
         * */
        set: function (key, value) {
            this.remove(key);

            while (this.list.length >= this.options.limit) {
                var dropped = this.list.shift();
                this.options.onRemove(dropped.value, dropped.key, true);
            }

            this.list.push({
                key: key,
                value: value
            });
            return this;
        },

        /**
         * Alias to #has
         *
         * @param {string} key The key to check with
         * @return {Object} this
         */
        contains: function (key) {
            return this.has(key);
        },

        /**
         * Check whether the given key exists within the namespace, or whether the namespace exists if key not set.
         *
         * @param {string} key The key to check with
         * @return {Object} this
         */
        has: function (key) {
            return this.findIndexByKey(key) > -1;
        },

        /**
         * Rename a cache item
         *
         * @param {string} before The source key for your cache item
         * @param {string} after The destination key for your cache item
         * @return {Object} this
         */
        rename: function (before, after) {
            if (before === after) {
                return this;
            }

            this.remove(after);
            var idx = this.findIndexByKey(before);
            if (idx === -1) {
                throw new Error('key not found:' + before);
            }

            this.list[idx].key = after;
            return this;
        },

        /**
         * Remove a specific `key` in namespace `name`
         *
         * @param {string} key The key to remove
         * @return {Object} this
         * */
        remove: function (key) {
            var idx = this.findIndexByKey(key);
            if (idx > -1) {
                var item = this.list[idx];
                this.options.onRemove(item.value, item.key, false);
                this.list.splice(idx, 1);
            }

            return this;
        },

        size: function () {
            return this.list.length;
        },

        /**
         * Clear the given namespace, or all namespaces if `name` not set.
         *
         * @param {string} name The namespace to clear.
         * @return {Object} this
         * */
        clear: function () {
            this.list = [];
            return this;
        },

        /**
         * Find the index of the given key exists in list,
         *
         * @private
         * @param {string} key The key to find
         * @return {number} return the index of the given key, false if not found
         * @example
         * findIndexByKey('k', [{'k':'v'}])    // yields 0
         */
        findIndexByKey: function (key) {
            return _.findIndex(this.list, function (item) {
                return item.key === key;
            });
        }
    };

    return Namespace;
});

