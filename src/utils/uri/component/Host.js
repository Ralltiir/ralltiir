/**
 * @file host component
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var inherits = require('../../../lang/underscore').inherits;
    var Abstract = require('./Abstract');

    /**
     * Host
     *
     * @constructor
     * @param {string} data 数据
     */
    function Host(data) {
        Abstract.call(this, data);
    }

    inherits(Host, Abstract);

    /**
     * 设置host
     * 忽略大小写
     *
     * @public
     * @param {string} host Host
     */
    Host.prototype.set = function (host) {
        host = host || '';
        this.data = host.toLowerCase();
    };

    /**
     * 比较host
     * 忽略大小写
     *
     * @public
     * @param {string|Host} host Host
     * @return {boolean}
     */
    Host.prototype.equal = function (host) {
        if (host instanceof Host) {
            host = host.get();
        }
        else {
            host = host || '';
        }
        return this.data === host.toLowerCase();
    };

    return Host;
});
