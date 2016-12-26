/**
 * @file port component
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var inherits = require('../../../lang/underscore').inherits;
    var Abstract = require('./Abstract');

    /**
     * 常见协议的默认端口号
     *
     * @const
     * @type {Object}
     */
    var DEFAULT_PORT = {
            ftp: '21',
            ssh: '22',
            telnet: '23',
            http: '80',
            https: '443',
            ws: '80',
            wss: '443'
        };

    /**
     * Prot
     *
     * @constructor
     * @param {string} data 端口号
     */
    function Port(data) {
        Abstract.call(this, data);
    }

    inherits(Port, Abstract);

    /**
     * 比较port
     *
     * @public
     * @param {string|Port} port 端口号
     * @param {string=} scheme 协议
     * @return {boolean}
     */
    Port.prototype.equal = function (port, scheme) {
        var myPort = this.data || DEFAULT_PORT[scheme];
        if (port instanceof Port) {
            port = port.get();
        }
        port = port || DEFAULT_PORT[scheme];

        return myPort === port;
    };

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    Port.prototype.toString = function () {
        return this.data ? ':' + this.data : '';
    };

    return Port;
});
