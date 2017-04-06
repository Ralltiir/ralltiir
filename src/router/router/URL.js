/**
 * @file url处理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Path = require('../../utils/uri/component/Path');
    var Query = require('../../utils/uri/component/Query');
    var Fragment = require('../../utils/uri/component/Fragment');
    var config = require('./config');
    // Spec. RFC3986: URI Generic Syntax
    // see: https://tools.ietf.org/html/rfc3986#page-50
    var URIRegExp = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?');

    var DEFAULT_TOKEN = '?';

    /**
     * URL
     *
     * @constructor
     * @param {string} str url
     * @param {Object=} options 选项
     * @param {Object=} options.query 查询条件
     * @param {URL=} options.base 基路径
     * @param {string=} options.root 根路径
     */
    function URL(str, options) {
        options = options || {};
        str = (str || '').trim() || config.path;

        var match = URIRegExp.exec(str);
        // ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
        //  12            3  4          5       6  7        8 9
        if (!match) {
            // eslint-disable-next-line
            console.warn('URI not valid:');
        }

        var token = this.token = options.token || DEFAULT_TOKEN;
        var root = options.root || config.root;
        if (root.charAt(root.length - 1) === '/') {
            root = root.substring(0, root.length - 1);
        }

        this.root = root;

        str = str.split('#');
        this.fragment = new Fragment(str[1]);

        str = str[0].split(token);
        var base = options.base || {};
        this.path = new Path(str[0], base.path);
        this.query = new Query(str[1]);

        // 路径修正
        // * 针对相对路径修正
        // * 添加默认的'/'
        var path = this.path.get();
        this.outRoot = path.indexOf('..') === 0;
        if (this.outRoot) {
            path = Path.resolve(root + '/', path);
            if (path.indexOf(root) === 0) {
                path = path.substring(root.length);
                this.path.set(path);
                this.outRoot = false;
            }
        }

        if (!this.outRoot && path.charAt(0) !== '/') {
            this.path.set('/' + path);
        }

        if (options.query) {
            this.query.add(options.query);
        }
    }

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    URL.prototype.toString = function () {
        var root = this.root;
        var path = this.path.get();
        if (this.outRoot) {
            path = Path.resolve(root + '/', path);
        }
        else {
            path = root + path;
        }

        return path
            + this.query.toString(this.token)
            + this.fragment.toString();
    };

    /**
     * 比较Path
     *
     * @public
     * @param {string} path 路径
     * @return {boolean}
     */
    URL.prototype.equalPath = function (path) {
        return this.path.get() === path;
    };

    /**
     * 比较Path与Query是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equal = function (url) {
        return this.query.equal(url.query)
            && this.equalPath(url.path.get());
    };

    /**
     * 比较Path, Query及Fragment是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equalWithFragment = function (url) {
        return this.equal(url)
            && this.fragment.equal(url.fragment);
    };

    /**
     * 获取查询条件
     *
     * @public
     * @return {Object}
     */
    URL.prototype.getQuery = function () {
        return this.query.get();
    };

    /**
     * 获取路径
     *
     * @public
     * @return {string}
     */
    URL.prototype.getPath = function () {
        return this.path.get();
    };

    return URL;

});
