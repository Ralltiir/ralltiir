/**
 * @file action.js
 * @author harttle<harttle@harttle.com>
 */

define(function (require) {
    /**
     * @module action
     */

    var cache = require('./utils/cache');
    var Promise = require('./lang/promise');
    var assert = require('./lang/assert');
    var logger = require('./utils/logger');
    var _ = require('./lang/underscore');
    var dom = require('./utils/dom');
    var URL = require('./utils/url');

    function actionFactory(router, location, history, doc, Emitter, services) {
        var exports = new Emitter();
        var pages;
        var backManually;
        var indexPageUrl;
        var isIndexPage;
        var root;
        var pageId;
        var visitedClassName;

        // The state data JUST for the next dispatch
        var stageData = {};
        var dispatchQueue = mkDispatchQueue();

        /**
         * This is provided to reset closure variables which defines the inner state.
         *
         * @private
         */
        exports.init = function () {
            services.init(this.dispatch);
            exports.pages = pages = cache.create('pages', {
                onRemove: function (page, url, evicted) {
                    if (_.isFunction(page.onRemove)) {
                        page.onRemove(url, evicted);
                    }
                },
                limit: 32
            });
            backManually = false;
            visitedClassName = 'visited';
            root = '/';
            indexPageUrl = '/';
            isIndexPage = true;
            pageId = 0;
        };

        /**
         * Get the stage data being passed to next dispatch
         *
         * @private
         * @return {Object} current state
         */
        exports.getState = function () {
            return stageData;
        };

        /**
         *  Register a service instance to action
         *
         *  @static
         *  @param {string|RestFul|RegExp} pathPattern The path of the service
         *  @param {Object} service The service object to be registered
         *  @example
         *  action.regist('/person', new Service());
         *  action.regist('/person/:id', new Service());
         *  action.regist(/^person\/\d+/, new Service());
         * */
        exports.regist = function (pathPattern, service) {
            assert(pathPattern, 'invalid path pattern');
            assert(service, 'invalid service');
            service.singleton = true;
            services.register(pathPattern, null, service);
        };

        /**
         * Un-register a service by path
         *
         * @param {string|RestFul|RegExp} pathPattern The path of the service
         */
        exports.unregist = function (pathPattern) {
            services.unRegister(pathPattern);
        };

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
         *
         *  @static
         *  @param {Object} current The current scope
         *  @param {Object} prev The previous scope
         *  @return {Promise}
         * */
        exports.dispatch = function (current, prev) {
            assert(current, 'cannot dispatch with options:' + current);

            logger.log('action dispatching to: ' + current.url);
            exports.emit('dispatching', {
                current: current,
                previous: prev,
                extra: stageData
            });

            var src = _.get(current, 'options.src');

            var prevService = services.getOrCreate(prev.url, prev.pathPattern);
            prev.service = prevService;
            var currentService = services.getOrCreate(
                current.url,
                current.pathPattern,
                // 是 redirect 或 hijack
                src !== 'history' && src !== 'back'
            );
            current.service = currentService;

            if (!pages.contains(current.url)) {
                pages.set(current.url, {
                    id: pageId,
                    isIndex: isIndexPage
                });
            }
            current.page = pages.get(current.url);
            prev.page = pages.get(prev.url);

            var data = stageData;
            stageData = {};

            if (backManually) {
                backManually = false;
                current.options.src = 'back';
            }

            // mark initial page
            if (current.options && current.options.src === 'sync') {
                indexPageUrl = current.url || '/';
            }
            else {
                isIndexPage = false;
            }

            doc.ensureAttached();
            // Abort currently the running dispatch queue,
            // and initiate a new one.
            return dispatchQueue.reset([
                function prevDetach() {
                    if (!prevService) {
                        return;
                    }
                    return prevService.singleton
                        ? prevService.detach(current, prev, data)
                        : prevService.beforeDetach(current, prev, data);
                },
                function currCreate() {
                    if (!currentService) {
                        return;
                    }
                    return currentService.singleton
                        ? currentService.create(current, prev, data)
                        : currentService.beforeAttach(current, prev, data);
                },
                function prevDestroy() {
                    if (!prevService) {
                        return;
                    }
                    return prevService.singleton
                        ? prevService.destroy(current, prev, data)
                        : prevService.detach(current, prev, data);
                },
                function currAttach() {
                    if (!currentService) {
                        return;
                    }
                    return currentService.attach(current, prev, data);
                }
            ]).exec(function currAbort() {
                if (currentService && currentService.abort) {
                    currentService.abort(current, prev, data);
                }
            });
        };

        /**
         * Check if currently in initial page
         *
         * @return {boolean} whether current page is the index page
         */
        exports.isIndexPage = function () {
            return isIndexPage;
        };

        /**
         * Execute a queue of functions in serial, and previous execution will be stopped.
         * This is a singleton closure containing current execution queue and threadID.
         *
         * A thread (implemented by mapSeries) will be initiated for each execution.
         * And anytime there's a new thread initiating, the previous threads will stop running.
         *
         * @return {Object} DispatchQueue interfaces: {reset, exec}
         * @private
         */
        function mkDispatchQueue() {
            // Since we cannot quit a promise, there can be multiple threads running, actually.
            var MAX_THREAD_COUNT = 10000;
            // This is the ID of the currently running thread
            var threadID = 0;
            var lastAbortCallback;
            var queue = [];
            var exports = {
                reset: reset,
                exec: exec,
                aborted: false
            };

            /**
             * When reset called, a thread containing a queue of functions is initialized,
             * and latter functions in last thread will be ommited.
             *
             * @param {Array} q the tasks to be queued
             * @return {Object} The DispatchQueue object
             */
            function reset(q) {
                queue = q;
                threadID = (threadID + 1) % MAX_THREAD_COUNT;
                return exports;
            }

            /**
             * When exec called, current queue is executed in serial,
             * and a promise for the results of the functions is returned.
             *
             * @param {Function} abortCallback The callback to be called when dispatch aborted
             * @return {Promise} The promise to be resolved when all tasks completed
             */
            function exec(abortCallback) {
                // Record the thread ID for current thread
                // To ensure there's ONLY ONE thread running.
                var thisThreadID = threadID;
                if (_.isFunction(lastAbortCallback)) {
                    lastAbortCallback();
                }
                lastAbortCallback = abortCallback;
                return Promise.mapSeries(queue, function (cb) {
                    if (typeof cb !== 'function') {
                        return;
                    }
                    // Just stop running
                    if (thisThreadID !== threadID) {
                        return;
                    }
                    logger.log('calling lifecycle', cb.name);
                    return cb();
                }).catch(function (e) {
                    // throw asyncly rather than console.error(e.stack)
                    // to enable browser console's error tracing.
                    setTimeout(function () {
                        throw e;
                    });
                }).then(function () {
                    lastAbortCallback = null;
                });
            }

            return exports;
        }

        /**
         *  Check if the specified service has been registered
         *
         *  @static
         *  @param {string} urlPattern The path of the service
         *  @return {boolean} Returns true if it has been registered, else false.
         * */
        exports.exist = function (urlPattern) {
            return services.isRegistered(urlPattern);
        };

        /**
         *  config the action, called by action.start
         *
         *  @param {Object} options key/value pairs to config the action
         *  @static
         * */
        exports.config = function (options) {
            options = options || {};
            if (options.root) {
                root = options.root;
            }
            if (options.visitedClassName) {
                visitedClassName = options.visitedClassName;
            }
            router.config(options);
        };

        /**
         * Redirect to another page, and change to next state
         *
         * @static
         * @param {string} url The URL to redirect
         * @param {string} query The query string to redirect
         * @param {Object} options The router options to redirect
         * @param {string} options.title Optional, 页面的title
         * @param {boolean} options.force Optional, 是否强制跳转
         * @param {boolean} options.silent Optional, 是否静默跳转（不改变URL）
         * @param {Object} data extended data being passed to `current.options`
         * */
        exports.redirect = function (url, query, options, data) {
            logger.log('action redirecting to: ' + url);
            exports.emit('redirecting', url);
            url = resolveUrl(url);
            _.assign(stageData, data);
            options = _.assign({}, options, {
                id: pageId++
            });
            try {
                if (options.silent) {
                    transferPageTo(url, query);
                }
                router.redirect(url, query, options);
            }
            catch (e) {
                e.url = URL.resolve(root, url);
                location.replace(e.url);
                exports.emit('redirectFailed', e);
                throw e;
            }
        };

        function resolveUrl(url) {
            var urlObj = URL.parse(url);

            // Ralltiir protocol, eg. sfr://root
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
         *
         *  @static
         * */
        exports.back = function () {
            backManually = true;
            history.back();
        };

        /**
         * Reset/replace current state
         *
         * @static
         * @param {string} url The URL to reset
         * @param {string} query The query string to reset
         * @param {Object} options The router options
         * @param {string} options.title Optional, 页面的title
         * @param {boolean} options.force Optional, 是否强制跳转
         * @param {boolean} options.silent Optional, 是否静默跳转（不改变URL）
         * @param {Object} data extended data being passed to `current.options`
         * */
        exports.reset = function (url, query, options, data) {
            if (isIndexPage) {
                indexPageUrl = url;
            }

            transferPageTo(url, query);
            _.assign(stageData, data);
            router.reset(url, query, options);
        };

        function transferPageTo(url, query) {
            var noRootUrl = router.ignoreRoot(location.pathname + location.search);
            var from = router.createURL(noRootUrl).toString();
            var to = router.createURL(url, query).toString();
            logger.log('[transfering page] from:', from, 'to:', to);
            pages.rename(from, to);
        }

        /**
         *  hijack global link href
         *
         *  @private
         *  @param {Event} event The click event object
         * */
        function onAnchorClick(event) {
            event = event || window.event;
            var targetEl = closest(event.target || event.srcElement, 'A');

            if (!targetEl) {
                return;
            }

            // link href only support url like pathname,e.g:/sf?params=
            var link = targetEl.getAttribute('data-sf-href');
            var options = targetEl.getAttribute('data-sf-options');

            if (link) {
                event.preventDefault();
                try {
                    options = JSON.parse(options) || {};
                }
                catch (err) {
                    // eslint-disable-next-line
                    console.warn('JSON parse failed, fallback to empty options');
                    options = {};
                }
                options.src = 'hijack';
                var extra = {
                    event: event,
                    anchor: targetEl
                };
                exports.redirect(link, null, options, extra);
                dom.addClass(targetEl, visitedClassName);
            }
        }

        /**
         * Find the closes ancestor matching the tagName
         *
         * @private
         * @param {DOMElement} element The element from which to find
         * @param {string} tagName The tagName to find
         * @return {DOMElement} The closest ancester matching the tagName
         */
        function closest(element, tagName) {
            var parent = element;
            while (parent !== null && parent.tagName !== tagName.toUpperCase()) {
                parent = parent.parentNode;
            }
            return parent;
        }

        /**
         *  Action init, call this to start the action
         *
         *  @param {Object} options key/value pairs to config the action, calling action.config() internally
         *  @static
         * */
        exports.start = function (options) {
            if (arguments.length) {
                exports.config(options);
            }
            document.body.addEventListener('click', onAnchorClick);
            router.start();
        };

        /**
         * Stop Ralltiir redirects
         */
        exports.stop = function () {
            document.body.removeEventListener('click', onAnchorClick);
            router.stop();
            router.clear();
        };

        /**
         * Destroy the action, eliminate side effects:
         * DOM event listeners, cache namespaces, external states
         */
        exports.destroy = function () {
            exports.stop();
            cache.destroy('pages');
            services.destroy();
            exports.pages = pages = undefined;
            services.unRegisterAll();
        };

        /**
         *  Update page, reset or replace current state accordingly
         *
         *  @static
         *  @param {string} url The URL to update
         *  @param {string} query The query string to update
         *  @param {Object} options The router options to update
         *  @param {Object} data The extended data to update, typically contains `container`, `page`, and `view`
         *  @return {Object} the action object
         * */
        exports.update = function (url, query, options, data) {
            options = options ? options : {};

            // use silent mode
            if (!options.hasOwnProperty('silent')) {
                options.silent = true;
            }
            var noRootUrl = router.ignoreRoot(location.pathname + location.search);
            var prevUrl = router.createURL(noRootUrl).toString();
            var currentUrl = router.ignoreRoot(url);
            var currentPath = (currentUrl || '').replace(/\?.*/, '');
            var routerOptions = router.getState();

            var transition = {
                from: {
                    url: prevUrl
                },
                to: {
                    url: currentUrl,
                    path: currentPath
                },
                extra: data
            };
            return exports.partialUpdate(url, {
                replace: true,
                state: routerOptions,
                transition: transition,
                to: data && data.container && data.container.get(0),
                query: query,
                options: options
            });
        };

        /**
         * Update partial content
         *
         * @param {string} [url=null] The url to update to, do not change url if null
         * @param {string} [options=] Update options
         * @param {string} [options.from=] The container element or the selector of the container element in the DOM of the retrieved HTML
         * @param {string} [options.to=] The container element or the selector of the container element in the current DOM
         * @param {string} [options.fromUrl=url] The url of the HTML to be retrieved
         * @param {boolean} [options.replace=false] Whether or not to replace the contents of container element
         * @return {Promise} A promise resolves when update finished successfully, rejected otherwise
         */
        exports.partialUpdate = function (url, options) {
            var noRootUrl = router.ignoreRoot(location.pathname + location.search);
            var currUrl = router.createURL(noRootUrl).toString();
            var page = pages.get(currUrl);
            transferPageTo(url, options.query);

            options = _.assign({}, {
                fromUrl: url,
                replace: false,
                routerOptions: {},
                page: page
            }, options);

            var service = services.getOrCreate(url);
            var pending = service.partialUpdate(url, options);
            options.routerOptions.silent = true;

            // postpone URL change until fetch request is sent
            router.reset(url || location.href, options.query, options.routerOptions);

            return Promise.resolve(pending);
        };

        exports.init();

        return exports;
    }
    return actionFactory;
});
