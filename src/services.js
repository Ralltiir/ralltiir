/**
 * @file Services Service factory for service instances / legacy static services
 * @author harttle<harttle@harttle.com>
 */

define(function (require) {
    var Map = require('./lang/map');
    var _ = require('@searchfe/underscore');
    var assert = require('@searchfe/assert');
    var logger = require('./utils/logger');
    var cache = require('./utils/cache');

    return function (router) {
        // 所有已经存在的 Service 实例：
        // * 对于新 Service 为对应 Service 类的实例
        // * 对于旧 Service 就是 Service 类本身
        var serviceInstances;
        var urlEntries;

        var actionDispatcher;
        var url2id;
        var exports = {
            init: init,
            destroy: destroy,
            register: register,
            postMessage: postMessage,
            unRegister: unRegister,
            isRegistered: isRegistered,
            unRegisterAll: unRegisterAll,
            getOrCreate: getOrCreate,
            setInstanceLimit: setInstanceLimit,
            copyServiceMapping: copyServiceMapping,
            urlEntries: null
        };
        var id = 0;

        function setInstanceLimit(n) {
            return exports.serviceInstances.setLimit(n);
        }

        function init(dispatcher) {
            url2id = new Map();
            actionDispatcher = dispatcher;
            urlEntries = exports.urlEntries = new Map();
            serviceInstances = exports.serviceInstances = cache.create('services', {
                onRemove: function (service, url, evicted) {
                    if (!service.singleton && _.isFunction(service.destroy)) {
                        return service.destroy(url, evicted);
                    }
                },
                limit: 8
            });
        }

        function destroy() {
            cache.destroy('services');
        }

        function register(pathPattern, config, service) {
            assert(pathPattern, 'invalid path pattern');
            assert(!urlEntries.has(pathPattern), 'path already registerd');

            config.pathPattern = pathPattern;
            router.add(pathPattern, actionDispatcher);
            urlEntries.set(pathPattern, {service: service, config: config});

            logger.info('service', service, 'registered to', pathPattern);
        }

        function postMessage(msg, target) {
            assert(target, 'message target should be set explicitly');
            serviceInstances.forEach(function (service) {
                if (!_.isFunction(service.onMessage)) {
                    return;
                }
                if (target === '*' || target === service.name) {
                    setTimeout(function () {
                        service.onMessage(msg);
                    });
                }
            });
        }

        function isRegistered(pathPattern) {
            return urlEntries.has(pathPattern);
        }

        function unRegisterAll(pathPattern) {
            urlEntries.keys().forEach(unRegister);
            urlEntries.clear();
        }

        function unRegister(pathPattern) {
            assert(pathPattern, 'invalid path pattern');
            assert(isRegistered(pathPattern), 'path not registered');
            router.remove(pathPattern);
            urlEntries.delete(pathPattern);
            logger.info('service unregistered from: ' + pathPattern);
        }

        function getService(url) {
            var id = url2id.get(url);
            if (id === undefined) {
                return undefined;
            }
            return serviceInstances.get(id);
        }

        function addInstance(url, instance) {
            var instanceId = id++;
            url2id.set(url, instanceId);
            instance.id = instanceId;
            serviceInstances.set(instanceId, instance);
            return instance;
        }

        function getOrCreate(url, pathPattern, conf) {
            // return if exist
            var service = getService(url);
            if (service) {
                return service;
            }

            // use static service instance
            if (arguments.length < 2) {
                pathPattern = router.pathPattern(url);
            }
            var entry = urlEntries.get(pathPattern);
            if (entry) {
                var Service = entry.service;
                var config = _.assign({}, entry.config, conf);
                var instance = Service.singleton ? Service : new Service(url, config);
                return addInstance(url, instance);
            }
        }

        /**
         * 拷贝 service 和 url 的对应关系
         *
         * @param {string} from 拷贝源 url
         * @param {string} to 拷贝目标 url
         * @return {boolean} 是否拷贝成功（不成功是因为没有源 service）
         */
        function copyServiceMapping(from, to) {
            var id = url2id.get(from);
            if (id !== undefined) {
                url2id.set(to, id);
                return true;
            }
            return false;
        }

        return exports;
    };
});
