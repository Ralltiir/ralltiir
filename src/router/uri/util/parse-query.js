/**
 * @file parse query
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {

    /**
     * 解析query
     *
     * @public
     * @param {string} query 查询条件
     * @return {Object}
     */
    function parse(query) {
        var res = {};

        query = query.split('&');
        var key;
        var value;
        query.forEach(function (item) {
            if (!item) {
                return;
            }

            item = item.split('=');
            key = item[0];
            value = item.length >= 2
                ? decodeURIComponent(item[1])
                : null;

            if (res[key]) {
                if (!Array.isArray(res[key])) {
                    res[key] = [res[key]];
                }
                res[key].push(value);
            }
            else {
                res[key] = value;
            }
        });

        return res;
    }

    return parse;

});
