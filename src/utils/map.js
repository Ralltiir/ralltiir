define(function() {

	var _ = require('./underscore');

	/*
	 * Map Data Structure
	 * Types of keys supported: String, RegExp
	 */
	function Map() {
		this.size = 0;
		this._data = {};
	}

	/*
	 * set key into the map
	 * @param {String|RegExp} k the key
	 * @param {any} v the value
	 * @return {undefined}
	 */
	Map.prototype.set = function(k, v) {
		k = _fingerprint(k);
		if (!this._data.hasOwnProperty(k)) {
			this._data[k] = v;
			this.size++;
		}
	};

	/*
	 * test if the key exists
	 * @param {String|RegExp} k the key
	 * @param {any} v the value
	 * @return {Boolean} Returns true if contains k, return false otherwise.
	 */
	Map.prototype.has = function(k) {
		k = _fingerprint(k);
		return this._data.hasOwnProperty(k);
	};

	/*
	 * delete the specified key
	 * @param {String|RegExp} k the key
	 * @return {undefined}
	 */
	Map.prototype.delete = function(k) {
		k = _fingerprint(k);
		if (this._data.hasOwnProperty(k)) {
			delete this._data[k];
			this.size--;
		}
	};

	/*
	 * get value by key
	 * @param {String|RegExp} k the key
	 * @return {any} the value associated to k
	 */
	Map.prototype.get = function(k) {
		k = _fingerprint(k);
		return this._data[k];
	};

	/*
	 * clear the map, remove all keys
	 */
	Map.prototype.clear = function(k) {
		this.size = 0;
		this._data = {};
	};

	/*
	 * Get string fingerprint for value
	 * @param {any} value The value to be summarized.
	 * @return {String} The fingerprint for the value.
	 */
	function _fingerprint(value) {
		if (_.isRegExp(value)) {
			return 'reg_' + value;
		} else if (_.isString(value)) {
			return 'str_' + value;
		} else {
			return 'other_' + value;
		}
	}

	return Map;
});
