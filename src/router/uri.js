/**
 * @file URI main file
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var URI = require('./uri/URI');

    /**
     * 创建URI对象
     *
     * @public
     * @param {...string|Object} data uri
     * @return {Object}
     */
    var exports = function (data) {
        return new URI(data);
    };


    /**
     * 解析URI字符串
     *
     * @public
     * @param {string} str URI字符串
     * @return {Object}
     */
    exports.parse = require('./uri/util/uri-parser');

    /**
     * resolve path
     *
     * @public
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    exports.resolve = require('./uri/component/Path').resolve;

    return exports;
});
