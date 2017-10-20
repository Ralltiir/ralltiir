/**
 * @file resource.js REST resource CRUD utility
 * @author harttle<yangjun14@baidu.com>
 * @module resource
 */
define(function (require) {
    var http = require('./utils/http');
    var _ = require('./lang/underscore');

    /**
     * The REST resource CRUD utility
     *
     * @constructor
     * @alias module:resource
     * @param {string} url The RESTful url pattern
     */
    function Resource(url) {
        this.url = url;
    }
    Resource.prototype = {

        /**
         * Get the URL for the given optionsions
         *
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {string} A string of URL.
         */
        'getUrl': function (options) {
            var url = this.url;
            // replace slugs with properties
            _.forOwn(options, function (v, k) {
                url = url.replace(':' + k, v);
            });
            // remove remaining slugs
            url = url.replace(/:[a-zA-Z]\w*/g, '');
            return url;
        },

        /**
         * Create an Object from `obj` with the given `options`.
         *
         * @param {Object} obj A plain Object to be created on the server.
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is created successful,
         * and rejects whenever there is an error.
         */
        'create': function (obj, options) {
            var url = this.getUrl(options);
            return http.post(url, obj);
        },

        /**
         * Query Objects with the given `options`.
         *
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when retrieved successful,
         * and rejects whenever there is an error.
         */
        'query': function (options) {
            var url = this.getUrl(options);
            return http.get(url);
        },

        /**
         * Update the object specified by `obj` with the given `options`.
         *
         * @param {Object} obj A plain object to update with.
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is updated successful,
         * and rejects whenever there is an error.
         */
        'update': function (obj, options) {
            var url = this.getUrl(options);
            return http.put(url, obj);
        },

        /**
         * Delete objects with the given `options`.
         *
         * @param {Object} options A set of key/value pairs to configure the URL query.
         * @return {Promise} A promise resolves when `obj` is deleted successful, and rejects whenever there is an error.
         */
        'delete': function (options) {
            var url = this.getUrl(options);
            return http.delete(url);
        }
    };

    Resource.prototype.constructor = Resource;

    return Resource;
});
