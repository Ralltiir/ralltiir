/**
 * @file path component
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var inherits = require('../../../lang/underscore').inherits;
    var Abstract = require('./Abstract');

    /**
     * normalize path
     * see rfc3986 #6.2.3. Scheme-Based Normalization
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function normalize(path) {
        if (!path) {
            path = '/';
        }

        return path;
    }

    /**
     * 获取目录
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function dirname(path) {
        path = path.split('/');
        path.pop();
        return path.join('/');
    }

    /**
     * 处理路径中的相对路径
     *
     * @inner
     * @param {Array} paths 分割后的路径
     * @param {boolean} overRoot 是否已超出根目录
     * @return {Array}
     */
    function resolveArray(paths, overRoot) {
        var up = 0;
        for (var i = paths.length - 1, item; item = paths[i]; i--) {
            if (item === '.') {
                paths.splice(i, 1);
            }
            else if (item === '..') {
                paths.splice(i, 1);
                up++;
            }
            else if (up) {
                paths.splice(i, 1);
                up--;
            }
        }

        if (overRoot) {
            while (up-- > 0) {
                paths.unshift('..');
            }
        }

        return paths;
    }

    /**
     * Path
     *
     * @constructor
     * @param {string} data 路径
     * @param {string|Path=} base 相对路径
     */
    function Path(data, base) {
        Abstract.call(this, data, base);
    }

    /**
     * 应用路径
     *
     * @public
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    Path.resolve = function (from, to) {
        to = to || '';

        if (to.charAt(0) === '/') {
            return Path.resolve(to);
        }

        var isAbsolute = from.charAt(0) === '/';
        var isDir = false;
        if (to) {
            from = dirname(from);
            isDir = to.charAt(to.length - 1) === '/';
        }
        // 对于`/`不处理
        else if (from.length > 1) {
            isDir = from.charAt(from.length - 1) === '/';
        }

        var path = from.split('/')
            .concat(to.split('/'))
            .filter(
                function (item) {
                    return !!item;
                }
            );

        path = resolveArray(path, !isAbsolute);


        return (isAbsolute ? '/' : '')
            + (path.length > 0 ? path.join('/') + (isDir ? '/' : '') : '');
    };

    inherits(Path, Abstract);

    /**
     * 设置path
     *
     * @public
     * @param {string} path 路径
     * @param {string|Path=} base 相对路径
     */
    Path.prototype.set = function (path, base) {
        if (base instanceof Path) {
            base = base.get();
        }

        var args = [path || ''];
        if (base) {
            args.unshift(base);
        }
        this.data = Path.resolve.apply(Path, args);
    };

    /**
     * 比较path
     *
     * @public
     * @param {string|Path} path 路径
     * @return {boolean}
     */
    Path.prototype.equal = function (path) {
        var myPath = normalize(this.data);

        if (path instanceof Path) {
            path = normalize(path.get());
        }
        else {
            path = normalize(Path.resolve(path || ''));
        }

        return myPath === path;
    };

    /**
     * 应用路径
     *
     * @public
     * @param {string|Path} path 起始路径
     * @param {boolean} from 目标路径
     */
    Path.prototype.resolve = function (path, from) {
        if (path instanceof Path) {
            path = path.get();
        }

        var args = [this.data];
        if (from) {
            args.unshift(path);
        }
        else {
            args.push(path);
        }

        this.data = Path.resolve.apply(Path, args);
    };

    return Path;
});
