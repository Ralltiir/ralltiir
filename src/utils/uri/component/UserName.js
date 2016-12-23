/**
 * @file username component
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var _ = require('../../../lang/underscore');
    var Abstract = require('./Abstract');

    /**
     * UserName
     *
     * @constructor
     * @param {string} data 用户名
     */
    function UserName(data) {
        Abstract.call(this, data);
    }

    _.inherits(UserName, Abstract);

    return UserName;
});
