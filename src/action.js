/*
 * A Service Management Singleton
 *
 * Accepts service registration and provides service switch,
 * which is triggered by the Router
 */

define(function() {

    var Promise = require('utils/promise');
    var assert = require('utils/assert');
    var Map = require('utils/map');
    var _ = require('utils/underscore');
    var URL = require('utils/url');
    var debug = require('utils/debug');

    function actionFactory(router, location) {
        var exports = {};
        var serviceMap, backManually, indexPageUrl, isIndexPage, root, pageId

        // The state data JUST for the next dispatch
        var stageData = {};
        var dispatchQueue = DispatchQueue();

        /*
         * This is provided to reset closure variables which defines the inner state.
         * @private
         */
        exports.init = function() {
            serviceMap = new Map();
            backManually = false;
            root = '/';
            indexPageUrl = '/';
            isIndexPage = true;
            pageId = 0;
        };

        /*
         * Get the stage data being passed to next dispatch
         * @private
         */
        exports.getState = function() {
            return stageData;
        };

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
            if (DEBUG) {
                debug.log("service registered to: " + url);
            }
        };

        /*
         * Un-register a service by path
         * @param {String|RestFul|RegExp} url The path of the service
         */
        exports.unregist = function(url) {
            assert(url, 'illegal action url');
            assert(serviceMap.has(url), 'path not registered');
            router.remove(url);
            serviceMap.delete(url);
            if (DEBUG) {
                debug.log("service unregistered from: " + url);
            }
        }

        /**
         *  Check if value is a valid service instance
         *  @param {any} value The value to check.
         *  @return {Boolean} Returns true if value is a service, else false.
         * */
        function isService(value) {
            // duck test...
            if (typeof value === 'object' &&
                value.create &&
                value.attach &&
                value.detach &&
                value.destroy &&
                value.update) {
                return true;
            } else {
                return false;
            }
        }

        /**
         *  Switch from the previous service to the current one.
         *  Call `prev.detach`, `prev.destroy`, 
         *  `current.create`, `current.attach` in serial.
         *  Typically called by the Router, 
         *  you may not want to call dispatch manually.
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
            assert(current, 'cannot dispatch with options:' + current);

            if (DEBUG) {
                debug.log("action dispatching to: " + current.url);
            }

            var proxyList = [];
            var currentService = serviceMap.get(current.pathPattern);
            var prevService = serviceMap.get(prev.pathPattern);

            var data = stageData;
            stageData = {};

            if (backManually) {
                backManually = false;
                current.options.src = 'back';
            }

            // mark initial page out
            if (current.options && current.options.src === 'sync') {
                indexPageUrl = current.url || '/';
            } else {
                isIndexPage = false;
            }

            // Abort currently the running dispatch queue, 
            // and initiate a new one.
            return dispatchQueue.reset([
                function prevDetach() {
                    if (!prevService) return;
                    return prevService.detach(current, prev, data);
                },
                function currCreate() {
                    if (!currentService) return;
                    return currentService.create(current, prev, data);
                },
                function prevDestroy() {
                    if (!prevService) return;
                    return prevService.destroy(current, prev, data);
                },
                function currAttach() {
                    if (!currentService) return;
                    return currentService.attach(current, prev, data);
                }
            ]).exec();
        };

        /*
         * Check if currently in initial page
         */
        exports.isIndexPage = function() {
            return isIndexPage;
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
            function exec() {
                // Record the thread ID for current thread
                // To ensure there's ONLY ONE thread running.
                var thisThreadID = threadID;
                return Promise.mapSeries(queue, function(cb) {
                    if (typeof cb !== 'function') return;
                    // Just stop running
                    if (thisThreadID !== threadID) return;
                    if (DEBUG) {
                        debug.log('calling lifecycle', cb.name);
                    }
                    return cb();
                }).catch(function(e) {
                    // throw asyncly rather than console.error(e.stack)
                    // to enable browser console's error tracing.
                    setTimeout(function() {
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
         *  config the action, called by action.start
         *  @param {Object} options key/value pairs to config the action
         *  @static
         * */
        exports.config = function(options) {
            if (options && options.root) {
                root = options.root;
            }
            router.config(options);
        };

        /**
         *  Clear all registered service
         *  @static
         * */
        exports.clear = function() {
            serviceMap.clear();
            router.clear();
        };

        /**
         * Redirect to another page, and change to next state
         * @static
         * @param {String} url The URL to redirect
         * @param {String} query The query string to redirect
         * @param {Object} options The router options to redirect
         * @param {String} options.title Optional, 页面的title
         * @param {Boolean} options.force Optional, 是否强制跳转
         * @param {Boolean} options.silent Optional, 是否静默跳转（不改变URL）
         * @param {Object} data extended data being passed to `current.options`
         * */
        exports.redirect = function(url, query, options, data) {
            if (DEBUG) {
                debug.log("action redirecting to: " + url);
            }
            url = resolveUrl(url);
            _.assign(stageData, data);
            options = _.assign({}, options, {
                id: pageId++
            });
            try {
                router.redirect(url, query, options);
            } catch (e) {
                url = URL.resolve(root, url);
                location.replace(url);
                throw e;
            }
        };

        function resolveUrl(url) {
            var urlObj = URL.parse(url);

            // Superframe protocol, eg. sfr://root
            if (urlObj.scheme === 'sfr') {
                if (urlObj.host === 'index') {
                    return indexPageUrl;
                }
            }

            // fallback to url
            return url;
        }

        /**
         *  Back to last state
         *  @static
         * */
        exports.back = function() {
            backManually = true;
            history.back();
        };

        /**
         * Reset/replace current state
         * @static
         * @param {String} url The URL to reset
         * @param {String} query The query string to reset
         * @param {Object} options The router options
         * @param {String} options.title Optional, 页面的title
         * @param {Boolean} options.force Optional, 是否强制跳转
         * @param {Boolean} options.silent Optional, 是否静默跳转（不改变URL）
         * @param {Object} data extended data being passed to `current.options`
         * */
        exports.reset = function(url, query, options, data) {
            if (isIndexPage) {
                indexPageUrl = url;
            }
            _.assign(stageData, data);
            router.reset(url, query, options);
        };

        /**
         *  hijack global link href
         *  @private
         *  @param {Event} event The click event object
         * */
        function _onAnchorClick(event) {
            event = event || window.event;
            var targetEl = _closest(event.target || event.srcElement, "A");

            if (!targetEl) return;

            //link href only support url like pathname,e.g:/sf?params=
            var link = targetEl.getAttribute('data-sf-href');
            var options = targetEl.getAttribute('data-sf-options');

            if (link) {
                event.preventDefault();
                try {
                    options = JSON.parse(options) || {};
                } catch (err) {
                    options = {};
                }
                options.src = "hijack";
                exports.redirect(link, null, options);
            }
        }

        /*
         * Find the closes parent (matching the tagName)
         * @private
         */
        function _closest(element, tagName) {
            var parent = element;
            while (parent !== null && parent.tagName !== tagName.toUpperCase()) {
                parent = parent.parentNode;
            }
            return parent;
        }

        /**
         *  Action init, call this to start the action
         *  @param {Object} options key/value pairs to config the action, calling action.config() internally
         *  @static 
         * */
        exports.start = function(options) {
            if (arguments.length) {
                exports.config(options);
            }
            document.body.addEventListener("click", _onAnchorClick);
            router.start();
        };

        /*
         * Stop superframe redirects
         */
        exports.stop = function() {
            document.body.removeEventListener("click", _onAnchorClick);
            router.stop();
        };

        /**
         *  Update page, reset or replace current state accordingly
         *  @static
         *  @param {String} url The URL to update
         *  @param {String} query The query string to update
         *  @param {Object} options The router options to update
         *  @param {Object} data The extended data to update, typically contains `container`, `page`, and `view`
         * */
        exports.update = function(url, query, options, data) {

            options = options ? options : {};

            //use silent mode
            if (!options.hasOwnProperty('silent')) {
                options.silent = true;
            }

            var prevUrl = location.href.replace(/.*\/([^/]+$)/, '/$1');

            var currentPath = location.pathname.replace(/.*\/([^/]+$)/, '/$1');

            var routerOptions = router.getState();

            if (!serviceMap.has(currentPath)) {
                throw new Error('service not found:' + currentPath);
            }
            var service = serviceMap.get(currentPath);
            var transition = {
                from: {
                    url: prevUrl
                },
                to: {
                    url: url,
                    path: currentPath
                },
                extra: data
            };
            router.reset(url, query, options);

            return Promise.resolve().then(function() {
                return service.update(routerOptions, transition, data);
            });
        };

        exports.init();

        return exports;
    }
    return actionFactory;
});
