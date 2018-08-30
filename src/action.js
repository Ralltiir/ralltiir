/**
 * @file action.js
 * @author harttle<yangjun14@baidu.com>
 */

define(function (require) {
    /**
     * @module action
     */

    var cache = require('./utils/cache');
    var Promise = require('@searchfe/promise');
    var assert = require('@searchfe/assert');
    var logger = require('./utils/logger');
    var _ = require('@searchfe/underscore');
    var dom = require('./utils/dom');
    var URL = require('./utils/url');

    // eslint-disable-next-line
    function actionFactory(router, location, history, doc, Emitter, services, dispatch) {
        var exports = new Emitter();
        var pages;
        var backManually;
        var indexPageUrl;
        var isIndexPage;
        var pageId;
        var config = {};

        // The state data JUST for the next dispatch
        var stageData = {};

        function createPages() {
            var pages = cache.create('pages', {
                onRemove: function (page, url, evicted) {
                    if (_.isFunction(page.onRemove)) {
                        page.onRemove(url, evicted);
                    }
                },
                limit: 1000000
            });
            function normalizeKey(fn, thisArg) {
                return function (url) {
                    arguments[0] = (url || '').replace(/#.*$/, '');
                    return fn.apply(thisArg, arguments);
                };
            }
            pages.get = normalizeKey(pages.get, pages);
            pages.set = normalizeKey(pages.set, pages);
            pages.contains = normalizeKey(pages.contains, pages);
            return pages;
        }

        function getCurrPageUrl() {
            return location.pathname + location.search;
        }

        /**
         * This is provided to reset closure variables which defines the inner state.
         *
         * @private
         */
        exports.init = function () {
            exports.started = false;
            services.init(this.dispatch);
            exports.pages = pages = createPages();
            backManually = false;
            config = {
                root: '/',
                visitedClassName: 'visited'
            };
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

            var prevService = services.getOrCreate(prev.url, prev.pathPattern);
            prev.service = prevService;
            var currentService = services.getOrCreate(current.url, current.pathPattern, {
                isRendered: !prevService
            });
            current.service = currentService;

            // MAGIC: 魔法子路由需要的魔法
            // 在两个实例相等，又都不是单例的情况下，认为是被复制的；此时不做 dispatch
            if (prevService && prevService === currentService && !prevService.singleton) {
                logger.log('prev service and current service are the same. disabled dispatch.');
                return;
            }

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

            logger.log('action dispatching to: ' + current.url);
            exports.emit('dispatching', {
                current: current,
                previous: prev,
                extra: stageData
            });

            doc.ensureAttached();

            return dispatch(current, prev, data);
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
         *  @return {Object} result config object
         *  @static
         * */
        exports.config = function (options) {
            if (arguments.length !== 0) {
                _.assign(config, options);
                router.config(config);
            }
            return config;
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

            var cancled = exports.emit('redirecting', url, query, options);
            if (cancled) {
                return;
            }

            url = resolveUrl(url);
            _.assign(stageData, data);
            options = _.assign({}, options, {
                id: pageId++
            });
            // 保存下浏览位置到当前url上；
            setScrollTopToPage();

            try {
                if (options.silent) {
                    copyPageTo(url, query);
                }
                router.redirect(url, query, options);
            }
            catch (e) {
                e.url = URL.resolve(config.root, url);
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

        function setScrollTopToPage() {
            var noRootUrl = getCurrPageUrl();
            var page;
            page = pages.get(noRootUrl);
            if (page) {
                page.scrollTop = window.pageYOffset;
            }
            else {
                pages.set(noRootUrl, {
                    scrollTop: window.pageYOffset
                });
            }
        }

        /**
         *  Back to last state
         *
         *  @static
         * */
        exports.back = function () {
            backManually = true;
            // 保存下浏览位置到当前url上；
            setScrollTopToPage();
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

            var cancled = exports.emit('reseting', url, query, options);
            if (cancled) {
                return;
            }

            if (isIndexPage) {
                indexPageUrl = url;
            }

            copyPageTo(url, query);
            _.assign(stageData, data);
            router.reset(url, query, options);
        };

        function copyPageTo(url, query) {
            var noRootUrl = router.ignoreRoot(location.pathname + location.search);
            var from = router.createURL(noRootUrl).toString();
            var to = router.createURL(url, query).toString();

            logger.log('[transfering page] from:', from, 'to:', to);
            if (!pages.contains(from)) {
                // eslint-disable-next-line
                console.warn('current page not found, cannot transfer to', url);
                return;
            }
            pages.set(to, pages.get(from));
        }

        /**
         *  hijack global link href
         *
         *  @private
         *  @param {Event} event The click event object
         * */
        function onAnchorClick(event) {
            event = event || window.event;
            var anchor = closest(event.target || event.srcElement, function (el) {
                return el.tagName === 'A';
            });

            if (!anchor) {
                return;
            }

            // link href only support url like pathname,e.g:/sf?params=
            var link = anchor.getAttribute('data-sf-href');
            var options = anchor.getAttribute('data-sf-options');
            var allowVisited = anchor.getAttribute('data-visited');

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
                    anchor: anchor
                };
                var url = baseUrl(anchor) + link;
                exports.redirect(url, null, options, extra);
                if (allowVisited !== 'off') {
                    dom.addClass(anchor, config.visitedClassName);
                }
            }
        }

        function baseUrl(anchor) {
            var rtView = closest(anchor, function (el) {
                return /(^|\s)rt-view($|\s)/.test(el.className);
            });
            if (!rtView) {
                return '';
            }
            return rtView.getAttribute('data-base') || '';
        }

        /**
         * Find the closes ancestor matching the tagName
         *
         * @private
         * @param {DOMElement} element The element from which to find
         * @param {Function} predict The predict function, called with the element
         * @return {DOMElement} The closest ancester matching the tagName
         */
        function closest(element, predict) {
            var parent = element;
            while (parent !== null && !predict(parent)) {
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
            exports.started = true;
        };

        /**
         * Stop Ralltiir redirects
         */
        exports.stop = function () {
            document.body.removeEventListener('click', onAnchorClick);
            router.stop();
            router.clear();
            exports.started = false;
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
            copyPageTo(url, options.query);

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
