/*
 * Superframe Debug Guildlines
 *
 * Enable debug log:
 *   window.DEBUG = true
 * Log to server:
 *   window.DEBUG = "http://
 */

define(function() {
	if(window.DEBUG === undefined){
        window.DEBUG = undefined;
    }
    var remote = window.DEBUG_SERVER;
    var timeOffset = Date.now();
    var lastTime = timeOffset;

    function reset() {
        lastTime = timeOffset = Date.now();
    }

    function log(msg) {
        var now = Date.now();
        var duration = (now - timeOffset) / 1000;

        var msg = '[' + duration + '(+' + (now - lastTime) + ')] ' + msg;
        doLog(msg);

        lastTime = now;
    }

    function doLog(msg) {
        console.log(msg);
        // Log to remote server
        if (remote) {
            var img = new Image();
            msg = msg.replace(/\s+/g, ' ').trim();
            img.src = remote + '/' + msg;
        }
    }

    return {
        log: log,
        reset: reset
    };
});
