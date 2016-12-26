/**
 * @file password component
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var inherits = require('../../../lang/underscore').inherits;
    var Abstract = require('./Abstract');

    /**
     * Password
     *
     * @constructor
     * @param {string} data 数据
     */
    function Password(data) {
        Abstract.call(this, data);
    }

    inherits(Password, Abstract);

    return Password;
});
