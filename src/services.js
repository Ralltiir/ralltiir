/**
 * @file Services Service factory for service instances / legacy static services
 * @author harttle<yangjvn@126.com>
 */

define(function (require) {
    var Map = require('lang/map');
    var _ = require('lang/underscore');
    var assert = require('lang/assert');
    var logger = require('utils/logger');
    var cache = require('utils/cache');

    return function (router) {
        // 所有已经存在的 Service 实例：
        // * 对于新 Service 为对应 Service 类的实例
        // * 对于旧 Service 就是 Service 类本身
        var serviceInstances;
        var serviceClasses;

        var actionDispatcher;
        var url2id;
        var exports = {
            init: init,
            destroy: destroy,
            register: register,
            unRegister: unRegister,
            getServiceClass: getServiceClass,
            isRegistered: isRegistered,
            unRegisterAll: unRegisterAll,
            getOrCreate: getOrCreate,
            setInstanceLimit: setInstanceLimit,
            serviceClasses: null
        };
        var id = 0;

        function setInstanceLimit(n) {
            return exports.serviceInstances.setLimit(n);
        }

        function init(dispatcher) {
            url2id = new Map();
            actionDispatcher = dispatcher;
            serviceClasses = exports.serviceClasses = new Map();
            serviceInstances = exports.serviceInstances = cache.create('services', {
                onRemove: function (service, url, evicted) {
                    _.isFunction(service.destroy) && service.destroy(url, evicted);
                },
                limit: 8
            });
        }

        function destroy() {
            cache.destroy('services');
        }

        function register(pathPattern, service) {
            assert(pathPattern, 'invalid path pattern');
            assert(!serviceClasses.has(pathPattern), 'path already registerd');

            router.add(pathPattern, actionDispatcher);
            serviceClasses.set(pathPattern, service);

            logger.log('service registered to: ' + pathPattern);
        }

        function isRegistered(pathPattern) {
            return serviceClasses.has(pathPattern);
        }

        function unRegisterAll(pathPattern) {
            serviceClasses.keys().forEach(unRegister);
            serviceClasses.clear();
        }

        function unRegister(pathPattern) {
            assert(pathPattern, 'invalid path pattern');
            assert(isRegistered(pathPattern), 'path not registered');
            router.remove(pathPattern);
            serviceClasses.delete(pathPattern);
            logger.log('service unregistered from: ' + pathPattern);
        }

        function getService(url) {
            var id = url2id.get(url);
            if (id === undefined) {
                return undefined;
            }
            return serviceInstances.get(id);
        }

        function getServiceClass(pathPattern) {
            return serviceClasses.get(pathPattern);
        }

        function addInstance(url, instance) {
            var instanceId = id++;
            url2id.set(url, instanceId);
            instance.id = instanceId;
            serviceInstances.set(instanceId, instance);
            return instance;
        }

        // 由于目前还是 URL 索引页面，ignoreCache 为同样 URL 创建新的页面仍不可行
        function getOrCreate(url, pathPattern, ignoreCache) {
            // return if exist
            var service = getService(url);
            if (service) {
                return service;
            }

            // use static service instance
            if (arguments.length < 2) {
                pathPattern = router.pathPattern(url);
            }
            var Service = getServiceClass(pathPattern);
            if (Service) {
                var instance = Service.instancEnabled ? new Service(url) : Service;
                return addInstance(url, instance);
            }
        }

        return exports;
    };
});
