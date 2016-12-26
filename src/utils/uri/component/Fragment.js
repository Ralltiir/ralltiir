/**
 * @file fragment component
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var inherits = require('../../../lang/underscore').inherits;
    var Abstract = require('./Abstract');

    var DEFAULT_PREFIX = '#';

    /**
     * Fragment
     *
     * @constructor
     * @param {string} data 数据
     */
    function Fragment(data) {
        Abstract.call(this, data);
    }

    inherits(Fragment, Abstract);

    /**
     * 字符串化
     *
     * @public
     * @param {string=} prefix 前缀分割符
     * @return {string}
     */
    Fragment.prototype.toString = function (prefix) {
        prefix = prefix || DEFAULT_PREFIX;
        return this.data ? prefix + this.data : '';
    };

    return Fragment;
});
