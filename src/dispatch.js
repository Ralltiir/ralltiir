/**
 * @file 页面分发处理
 * @author harttle<yangjvn@126.com>
 */

define(function (require) {
    var transitions = require('./transitions');
    var _ = require('@searchfe/underscore');
    var Promise = require('@searchfe/promise');

    return function dispatchFactory(location) {
        var dispatchQueue = mkDispatchQueue();

        /**
         * 遗留的 Service 切换实现，只适用于遗留的 Service 之间的切换
         *
         * @param {string} from 不可用
         * @param {string} to 不可用
         * @param {string} options 不可用
         * @param {string} legacyArgs 遗留参数，不可在其他实现中使用
         * @return {Promise} 页面切换完成
         */
        function legacyImpl(from, to, options, legacyArgs) {
            // Abort currently the running dispatch queue,
            // and initiate a new one.
            let prevService = legacyArgs.prevService;
            let currentService = legacyArgs.currentService;
            let current = legacyArgs.current;
            let prev = legacyArgs.prev;
            let data = legacyArgs.data;
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
            }, function errorHandler(e) {
                // eslint-disable-next-line
                console.error(e);
                if (_.get(current, 'options.src') !== 'sync') {
                    location.replace(location.href);
                }
            });
        }

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
             * @param {Function} errorHandler The callback to be called when error occurred
             * @return {Promise} The promise to be resolved when all tasks completed
             */
            function exec(abortCallback, errorHandler) {
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
                    return cb();
                })
                .catch(errorHandler)
                .then(function () {
                    lastAbortCallback = null;
                });
            }

            return exports;
        }

        /**
         * 页面切换
         *
         * @param {string} from 来源 Service
         * @param {string} to 目标 Service
         * @param {string} options 动画配置
         * @param {string} legacyArgs 给遗留 Service 代码使用，新 Service 使用新接口
         * @return {Promise} 切换完成
         */
        function dispatch(from, to, options, legacyArgs) {
            var fromName = from && from.name;
            var toName = to && to.name;
            var transition = transitions.getImpl(fromName, toName) || legacyImpl;
            return transition(from, to, options, legacyArgs);
        }

        return dispatch;
    };
});
