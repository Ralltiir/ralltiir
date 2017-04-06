/**
 * @file assert.js assert utility
 * @author harttle<yangjun14@baidu.com>
 */

define(function () {
    function assert(predict, msg) {
        if (!predict) {
            throw new Error(msg);
        }
    }
    return assert;
});
