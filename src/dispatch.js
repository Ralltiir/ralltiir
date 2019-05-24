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
         * @param {string} current 当前状态
         * @param {string} prev 上一个状态
         * @param {string} data 跳转配置
         * @return {Promise} 页面切换完成
         */
        function legacyImpl(current, prev, data) {
            // Abort currently the running dispatch queue,
            // and initiate a new one.
            return dispatchQueue.reset([
                function prevDetach() {
                    if (!prev.service) {
                        return;
                    }
                    return prev.service.singleton
                        ? prev.service.detach(current, prev, data)
                        : prev.service.beforeDetach(current, prev, data);
                },
                function currCreate() {
                    if (!current.service) {
                        return;
                    }
                    return current.service.singleton
                        ? current.service.create(current, prev, data)
                        : current.service.beforeAttach(current, prev, data);
                },
                function prevDestroy() {
                    if (!prev.service) {
                        return;
                    }
                    return prev.service.singleton
                        ? prev.service.destroy(current, prev, data)
                        : prev.service.detach(current, prev, data);
                },
                function currAttach() {
                    if (!current.service) {
                        return;
                    }
                    return current.service.attach(current, prev, data);
                }
            ]).exec(function currAbort() {
                if (current.service && current.service.abort) {
                    current.service.abort(current, prev, data);
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
         * @param {string} current 当前状态
         * @param {string} prev 上一个状态
         * @param {string} data 跳转配置
         * @return {Promise} 切换完成
         */
        function dispatch(current, prev, data) {

            // 如果存在守卫则调用
            if (current.service && current.service.guard) {
                if (current.service.guard(current, prev) === false) {
                    return false;
                }
            }

            // 如果存在守卫则调用
            if (prev.service && prev.service.guard) {
                if (prev.service.guard(current, prev) === false) {
                    return false;
                }
            }

            var fromName = prev.service && prev.service.name;
            var toName = current.service && current.service.name;

            var transition = transitions.getImpl(fromName, toName);
            if (transition) {
                var options = _.assign({
                    prev: prev,
                    current: current
                }, current, data);
                return transition(prev.service, current.service, options);
            }
            return legacyImpl(current, prev, data);
        }

        return dispatch;
    };
});
