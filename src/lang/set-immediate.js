/**
 * @file setImmediate polyfill for non-conformant browsers
 * @author harttle<yangjvn@126.com>
 */

define(function () {
    var global = getGlobal();
    var MSG = 'setImmediate polyfill';

    function immediate(cb) {
        // W3C conformant browsers
        if (global.setImmediate) {
            global.setImmediate(cb);
        }
        // Workers
        else if (global.MessageChannel) {
            var channel = new MessageChannel();
            channel.port1.onmessage = cb;
            channel.port2.postMessage(MSG);
        }
        // non-IE8
        else if (global.addEventListener && global.postMessage) {
            global.addEventListener('message', cb, false);
            global.postMessage(MSG, '*');
        }
        // Rest old browsers, IE8 goes here
        else {
            global.setTimeout(cb);
        }
    }

    function getGlobal() {
        if (typeof window !== 'undefined') {
            return window;
        }

        if (typeof self !== 'undefined') {
            return self;
        }

        // eslint-disable-next-line
        return Function('return this')();
    }

    return immediate;
});
