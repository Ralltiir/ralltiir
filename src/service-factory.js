/**
 * @file ServiceFactory Factory for service instances and legacy static services
 * @author harttle<harttle@126.com>
 */

define(function (require) {
    var Map = require('lang/map');
    var assert = require('lang/assert');
    var logger = require('utils/logger');

    return function (router) {
        var services;
        var actionDispatcher;
        var exports = {
            init: init,
            register: register,
            unRegister: unRegister,
            getByUrl: getByUrl,
            getByPathPattern: getByPathPattern,
            isRegistered: isRegistered,
            unRegisterAll: unRegisterAll,
            services: null
        };

        function register(pathPattern, service) {
            assert(pathPattern, 'invalid path pattern');
            assert(!services.has(pathPattern), 'path already registerd');

            router.add(pathPattern, actionDispatcher);
            services.set(pathPattern, service);

            logger.log('service registered to: ' + pathPattern);
        }

        function isRegistered(pathPattern) {
            return services.has(pathPattern);
        }

        function unRegisterAll(pathPattern) {
            services.keys().forEach(unRegister);
            services.clear();
        }

        function unRegister(pathPattern) {
            assert(pathPattern, 'invalid path pattern');
            assert(isRegistered(pathPattern), 'path not registered');
            router.remove(pathPattern);
            services.delete(pathPattern);
            logger.log('service unregistered from: ' + pathPattern);
        }

        function init(dispatcher) {
            services = exports.services = new Map();
            actionDispatcher = dispatcher;
        }

        function getByUrl(url) {
            var pathPattern = router.pathPattern(url);
            return getByPathPattern(pathPattern);
        }

        function getByPathPattern(pathPattern) {
            return services.get(pathPattern);
        }

        return exports;
    };
});
