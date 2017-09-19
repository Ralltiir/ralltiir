/**
 * @file map Map for JavaScript with ES6-compliant API but not ES6-compliant.
 * @author harttle<harttle@harttle.com>
 *
 * Limitations:
 * * Key equivalence is value based
 * * Types of keys supported: String, RegExp
 */

/* eslint-disable no-extend-native */

define(function (require) {

    var _ = require('./underscore');

    /**
     * Map utility
     *
     * @constructor
	 */
    function Map() {
        this.size = 0;
        this._data = {};
    }

    /**
	 * set key into the map
     *
	 * @param {string|RegExp} key the key
	 * @param {any} value the value
	 * @return {undefined}
	 */
    Map.prototype.set = function (key, value) {
        var k = fingerprint(key);
        if (!this._data.hasOwnProperty(k)) {
            this.size++;
        }
        this._data[k] = {
            key: key,
            value: value
        };
    };

    Map.prototype.keys = function (cb) {
        var data = this._data;
        return Object.keys(this._data).map(function (k) {
            var item = data[k];
            return item.key;
        });
    };

    Map.prototype.forEach = function (cb) {
        var data = this._data;
        Object.keys(this._data).forEach(function (k) {
            var item = data[k];
            cb(item.value, item.key);
        });
    };

    /**
	 * test if the key exists
     *
	 * @param {string|RegExp} key the key
	 * @param {any} v the value
	 * @return {boolean} Returns true if contains k, return false otherwise.
	 */
    Map.prototype.has = function (key) {
        var k = fingerprint(key);
        return this._data.hasOwnProperty(k);
    };

    /**
	 * delete the specified key
     *
	 * @param {string|RegExp} key the key
	 * @return {undefined}
	 */
    Map.prototype.delete = function (key) {
        var k = fingerprint(key);
        if (this._data.hasOwnProperty(k)) {
            delete this._data[k];
            this.size--;
        }
    };

    /**
	 * get value by key
     *
	 * @param {string|RegExp} key the key
	 * @return {any} the value associated to k
	 */
    Map.prototype.get = function (key) {
        var k = fingerprint(key);
        var item = this._data[k];
        return item ? item.value : undefined;
    };

    /**
	 * clear the map, remove all keys
     *
     * @param {string|RegExp} k the key
	 */
    Map.prototype.clear = function (k) {
        this.size = 0;
        this._data = {};
    };

    /**
	 * Get string fingerprint for value
     *
     * @private
	 * @param {any} value The value to be summarized.
	 * @return {string} The fingerprint for the value.
	 */
    function fingerprint(value) {
        if (_.isRegExp(value)) {
            return 'reg_' + value;
        }
        if (_.isString(value)) {
            return 'str_' + value;
        }
        return 'other_' + value;
    }

    return Map;
});
