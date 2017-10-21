/**
 * @file logger.js Ralltiir Debug Utility
 * @author harttle<yangjun14@baidu.com>
 */

define(function () {
    var timing = !!location.search.match(/logger-timming/i);
    var match = location.search.match(/logger-server=([^&]*)/i);
    var server = match ? decodeURIComponent(match[1]) : false;

    var timeOffset = Date.now();
    var lastTime = timeOffset;

    function reset() {
        lastTime = timeOffset = Date.now();
    }

    function assemble() {
        var args = Array.prototype.slice.call(arguments);

        if (timing) {
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

    function send(impl, args) {
        var fn = new Function('impl', 'args', 'impl.apply(console, args);');
        fn(impl, args);
        if (server) {
            var img = new Image();
            var msg = args.join(' ').replace(/\s+/g, ' ').trim();
            img.src = server + '/sfr/log/' + msg;
        }
    }

    function logFactory(level, impl) {
        return function () {
            var args = assemble.apply(null, arguments);
            send(impl, args);
        };
    }

    return {
        /* eslint-disable no-console */
        log: logFactory('log', console.log),
        debug: logFactory('debug', console.log),
        info: logFactory('info', console.info),
        warn: logFactory('warn', console.warn),
        error: logFactory('error', console.error),
        reset: reset
    };
});
