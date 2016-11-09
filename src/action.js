define(function() {

    var router = require('router/router');
    var Promise = require('utils/promise');
    var assert = require('utils/assert');
    var Map = require('utils/map');
    var _ = require('utils/underscore');
    var exports = {};
    var serviceMap = new Map();
    var indexUrl;
    var _backManually = false;
    var _dispatchQueue = DispatchQueue();

    /**
     *  Register a service instance to action
     *  @static
     *  @param {String|RestFul|RegExp} url The path of the service
     *  @param {Object} service The service object to be registered
     *  @return undefined
     *  @example
     *  action.regist('/person', new Service());
     *  action.regist('/person/:id', new Service());
     *  action.regist(/^person\/\d+/, new Service());
     * */
    exports.regist = function(url, service) {
        assert(url, 'illegal action url');
        assert(isService(service), 'illegal service, make sure to extend from sfr/service');
        assert(!serviceMap.has(url), 'path already registerd');
        router.add(url, this.dispatch);
        serviceMap.set(url, service);
    };

    /**
     *  Check if value is a valid service instance
     *  @param {any} value The value to check.
     *  @return {Boolean} Returns true if value is a service, else false.
     * */
    function isService(value) {
        // duck test...
        if(typeof value === 'object' 
                && value.create 
                && value.attach 
                && value.detach 
                && value.destroy 
                && value.update) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *  Switch from the previous service to the current one.
     *  Call prev.detach, prev.destroy, current.create, current.attach in serial.
     *
     *  If any of these callbacks returns a `Thenable`, it'll be await.
     *  If the promise is rejected, the latter callbacks will **NOT** be called.
     *
     *  Returns a promise that 
     *  resolves if all callbacks executed without throw (or reject),
     *  rejects if any of the callbacks throwed or rejected.
     *
     *  Note: If current and prev is the same service,
     *  the `prev.destroy` will **NOT** be called.
     *  @static
     *  @param {Object} current The current scope
     *  @param {Object} prev The previous scope
     *  @return {Promise}
     * */
    exports.dispatch = function(current, prev) {
        var proxyList = [];
        var currentService = serviceMap.get(current.pathPattern);
        var prevService = serviceMap.get(prev.pathPattern);

        current.options = current.options || {};
        if(_backManually){
            current.options.src = 'back';
            _backManually = false;
        }
        
        // Abort currently the running dispatch queue, 
        // and initiate a new one.
        return _dispatchQueue.reset([
            prevService && prevService.detach.bind(prevService, current, prev),
            currentService && currentService.create.bind(currentService, current, prev),
            //container will not be destroyed
            prev.url !== indexUrl && prevService && prevService.destroy.bind(prevService, current, prev),
            currentService && currentService.attach.bind(currentService, current, prev)
        ]).exec();
    };

    /*
     * Execute a queue of functions in serial, and previous execution will be stopped.
     * This is a singleton closure containing current execution queue and threadID.
     *
     * A thread (implemented by mapSeries) will be initiated for each execution.
     * And anytime there's a new thread initiating, the previous threads will stop running.
     *
     * @return {Object} DispatchQueue interfaces: {reset, exec}
     * @private
     */
    function DispatchQueue() {
        // Since we cannot quit a promise, there can be multiple threads running, actually.
        var MAX_THREAD_COUNT = 10000;
        // This is the ID of the currently running thread
        var threadID = 0;
        var queue = [];
        var exports = {
            reset: reset,
            exec: exec
        };

        /*
         * When reset called, a thread containing a queue of functions is initialized,
         * and latter functions in last thread will be ommited.
         */
        function reset(q) {
            queue = q;
            threadID = (threadID + 1) % MAX_THREAD_COUNT;
            return exports;
        }

        /*
         * When exec called, current queue is executed in serial, 
         * and a promise for the results of the functions is returned.
         */
        function exec(){
            // Record the thread ID for current thread
            // To ensure there's ONLY ONE thread running.
            var thisThreadID = threadID;
            return Promise.mapSeries(queue, function(cb){
                if(typeof cb !== 'function') return;
                // Just stop running
                if(thisThreadID !== threadID) return;
                return cb();
            }).catch(function(e){
                // throw asyncly rather than console.error(e.stack)
                // to enable browser console's error tracing.
                setTimeout(function(){
                    throw e;
                });
            });
        }

        return exports;
    }

    /**
     *  Remove a registered service
     *  @static
     *  @param {String} name The path of the service
     * */
    exports.remove = function(name) {
        return serviceMap.delete(name);
    };

    /**
     *  Check if the specified service has been registered
     *  @static
     *  @param {String} name The path of the service
     *  @return {Boolean} Returns true if it has been registered, else false.
     * */
    exports.exist = function(name) {
        return serviceMap.has(name);
    };

    /**
     *  Clear all registered service
     *  @static
     * */
    exports.clear = function(){
        serviceMap.clear();
        router.clear();
    };

    /**
     *  Redirect to another page, and change to next state
     *  @static
     *  @param {String} url The URL to redirect
     *  @param {String} query The query string to redirect
     *  @param {Object} options The router options to redirect
     * */
    exports.redirect = function(url, query, options) {
        router.redirect(url, query, options);
    };

    /**
     *  Back to last state
     *  @static
     * */
    exports.back = function() {
        _backManually = true;
        history.back(); 
    };

    /**
     *  Reset/replace current state
     *  @static
     *  @param {String} url The URL to reset
     *  @param {String} query The query string to reset
     *  @param {Object} options The router options to reset
     * */
    exports.reset = function(url, query, options) {
        router.reset(url, query, options);
    };


    /**
     *  hijack global link href
     *  @private
     *  @param {Event} e The click event object
     * */
    function _onAnchorClick(e, target) {
        //link href only support url like pathname,e.g:/sf?params=
        var link = target.getAttribute('data-sf-href');
        var options = target.getAttribute('data-sf-options');

        if(link) {
            try {
                options = JSON.parse(options) || {};
            } catch(err) {
                options = {};
            }
            options.src = "hijack";
            exports.redirect(link, null, options);

            e.preventDefault();
        }
    }

    function _delegateAnchorClick(cb){
        document.documentElement.addEventListener("click", function(event){
            event = event || window.event;
            var targetEl = _closest(event.target || event.srcElement, "A");
            if (targetEl) {
                cb(event, targetEl);
            }
        }, false);

        function _closest(element, tagName) {
            var parent = element;
            while (parent !== null && parent.tagName !== tagName.toUpperCase()) {
                parent = parent.parentNode;
            }
            return parent;
        }
    }

    /**
     *  Action init, call this to start the action
     *  @static 
     * */
    exports.start = function() {
        _delegateAnchorClick(_onAnchorClick);
    } ;

    /**
     *  Update page, reset or replace current state accordingly
     *  @static
     *  @param {String} url The URL to update
     *  @param {String} query The query string to update
     *  @param {Object} options The router options to update
     *  @param {Object} extend The extended data to update, contains a `container`, `page`, and `view`
     * */
    exports.update = function(url, query, options, extend) {
        
        options = options ? options : {};
        
        //use silent mode
        if(!options.hasOwnProperty('silent')) {
            options.silent = true;
        }

        var prevUrl = location.href.replace(/.*\/([^/]+$)/,'/$1');

        var name = location.pathname.replace(/.*\/([^/]+$)/,'/$1');

        if(serviceMap.has(name)) {
            var service = serviceMap.get(name);
            service.update({
                path: name,
                url: url,
                prevUrl: prevUrl,
                query: query,
                options: options,
                extend: extend
            });
        }
        
        router.reset(url, query, options);
    };
    
    return exports;
});
