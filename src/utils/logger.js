/**
 * @file logger.js Ralltiir Debug Utility
 * @author harttle<yangjun14@baidu.com>
 */

/* eslint-disable no-console */
define(function (require) {
    var enableTiming = !!location.search.match(/rt-debug-timming/i);
    var enableDebug = !!location.search.match(/rt-debug/i);
    var _ = require('@searchfe/underscore');
    var Emitter = require('../utils/emitter');

    var timeOffset = Date.now();
    var lastTime = timeOffset;
    var exports = new Emitter();

    if (enableDebug) {
        // eslint-disable
        console.log('Ralltiir debug enabled');
    }
    if (enableTiming) {
        console.log('Ralltiir timming debug enabled');
    }

    function reset() {
        lastTime = timeOffset = Date.now();
    }

    function assemble() {
        var args = Array.prototype.slice.call(arguments);

        if (enableTiming) {
            args.unshift('[' + getTiming() + ']');
        }

        var stack = (new Error('logger track')).stack || '';
        var line = stack.split('\n')[3] || '';
        var match;
        var location = '';

        match = /at\s+\(?(.*):\d+:\d+\)?$/.exec(line) || [];
        var url = match[1];

        match = /([^/?#]+)([?#]|$)/.exec(url) || [];
        var fileName = match[1];
        location += fileName ? fileName + ':' : '';

        match = /at ([\w\d.]+)\s*\(/.exec(line) || [];
        var funcName = match[1] || 'anonymous';
        location += funcName;

        args.unshift('[' + location + ']');
        return args;
    }

    function getTiming() {
        var now = Date.now();
        var duration = (now - timeOffset) / 1000;
        var ret = duration + '(+' + (now - lastTime) + ')';
        lastTime = now;
        return ret;
    }

    function send(level, impl, args) {
        impl.apply(console, args);
        args.unshift(level);
        exports.emit.apply(exports, args);
    }

    function logFactory(level, impl) {
        if (!enableDebug && /log|debug|info/.test(level)) {
            return _.noop;
        }
        return function () {
            var args = assemble.apply(null, arguments);
            send(level, impl, args);
        };
    }

    exports.log = logFactory('log', console.log);
    exports.debug = logFactory('debug', console.log);
    exports.info = logFactory('info', console.info);
    exports.warn = logFactory('warn', console.warn);
    exports.error = logFactory('error', console.error);
    exports.reset = reset;

    return exports;
});
/* eslint-enable no-console */
