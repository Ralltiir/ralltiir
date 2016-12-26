/**
 * @file scheme component
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var _ = require('../../../lang/underscore');
    var Abstract = require('./Abstract');

    /**
     * Scheme
     *
     * @constructor
     * @param {string} data 协议
     */
    function Scheme(data) {
        Abstract.call(this, data);
    }

    _.inherits(Scheme, Abstract);

    /**
     * 设置scheme
     * 忽略大小写
     *
     * @public
     * @param {string} scheme 协议
     */
    Scheme.prototype.set = function (scheme) {
        scheme = scheme || '';
        this.data = scheme.toLowerCase();
    };

    /**
     * 比较scheme
     * 忽略大小写
     *
     * @public
     * @param {string|Scheme} scheme 协议
     * @return {boolean}
     */
    Scheme.prototype.equal = function (scheme) {
        if (scheme instanceof Scheme) {
            scheme = scheme.get();
        }
        else {
            scheme = scheme || '';
        }
        return this.data === scheme.toLowerCase();
    };

    return Scheme;
});
