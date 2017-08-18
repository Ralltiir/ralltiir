/**
 * @file promise.js A Promise Implementation
 *
 * This implementation conforms to Promise/A+ spec. see: https://promisesaplus.com/
 * @author harttle <yangjun14@baidu.com>
 * @module Promise
 */

/* eslint-disable no-extend-native */

define(function (require) {
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var UNHANDLED_REJECTION_EVENT_MSG = 'cannot make RejectionEvent when promise not rejected';
    var config = {
        longStackTraces: false
    };
    var assert = require('./assert');
    var setImmediate = require('./set-immediate');

    /**
     * Create a new promise.
     * The passed in function will receive functions resolve and reject as its arguments
     * which can be called to seal the fate of the created promise.
     *
     * The returned promise will be resolved when resolve is called, and rejected when reject called or any exception occurred.
     * If you pass a promise object to the resolve function, the created promise will follow the state of that promise.
     *
     * @param {Function} cb The resolver callback.
     * @constructor
     * @alias module:Promise
     * @example
     * var p = new Promise(function(resolve, reject){
     *     true ? resolve('foo') : reject('bar');
     * });
     */
    function Promise(cb) {
        if (!(this instanceof Promise)) {
            throw 'Promise must be called with new operator';
        }

        if (typeof cb !== 'function') {
            throw 'callback not defined';
        }

        this._state = PENDING;
        this._result;
        this._fulfilledCbs = [];
        this._rejectedCbs = [];
        this._errorPending = false;
        this._fromResolver(cb);
    }

    Promise.prototype._fulfill = function (result) {
        this._result = result;
        this._state = FULFILLED;
        this._flush();
    };

    Promise.prototype._reject = function (err) {
        if (config.longStackTraces && err) {
            err.stack += '\n' + this._originalStack;
        }

        this._result = err;
        this._state = REJECTED;
        this._errorPending = true;
        this._flush();

        setImmediate(function () {
            this._checkUnHandledRejection();
        }.bind(this));
    };

    Promise.prototype._resolve = function (result) {
        if (isThenable(result)) {
            // result.then is un-trusted
            this._fromResolver(result.then.bind(result));
        }
        else {
            this._fulfill(result);
        }
    };

    /**
     * Resolve the un-trusted promise definition function: fn
     * which has exactly the same signature as the .then function
     *
     * @param {Function} fn the reslver
     */
    Promise.prototype._fromResolver = function (fn) {
        // ensure resolve/reject called once
        var resolved = false;
        var self = this;
        try {
            fn(function (result) {
                if (resolved) {
                    return;
                }

                resolved = true;
                self._resolve(result);
            }, function (err) {
                if (resolved) {
                    return;
                }

                resolved = true;
                self._reject(err);
            });
        }
        catch (err) {
            if (resolved) {
                return;
            }

            resolved = true;
            self._reject(err);
        }
    };

    Promise.prototype._checkUnHandledRejection = function () {
        if (this._errorPending) {
            var event = mkRejectionEvent(this);
            window.dispatchEvent(event);
        }

    };

    Promise.prototype._flush = function () {
        if (this._state === PENDING) {
            return;
        }

        var cbs = this._state === REJECTED ? this._rejectedCbs : this._fulfilledCbs;

        cbs.forEach(function (callback) {
            if (this._state === REJECTED && this._errorPending) {
                this._errorPending = false;
            }

            if (typeof callback === 'function') {
                var result = this._result;
                setImmediate(function () {
                    callback(result);
                });
            }

        }, this);
        this._rejectedCbs = [];
        this._fulfilledCbs = [];
    };

    /**
     * Register a callback on fulfilled or rejected.
     *
     * @param {Function} onFulfilled the callback on fulfilled
     * @param {Function} onRejected the callback on rejected
     */
    Promise.prototype._done = function (onFulfilled, onRejected) {
        this._fulfilledCbs.push(onFulfilled);
        this._rejectedCbs.push(onRejected);
        this._flush();
    };

    /**
     * The Promise/A+ .then, register a callback on resolve. See: https://promisesaplus.com/
     *
     * @param {Function} onFulfilled The fulfilled callback.
     * @param {Function} onRejected The rejected callback.
     * @return {Promise} A thenable.
     */
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var ret;
            self._done(function (result) {
                if (typeof onFulfilled !== 'function') {
                    return resolve(result);
                }
                try {
                    ret = onFulfilled(result);
                }
                catch (e) {
                    return reject(e);
                }
                resolve(ret);
            }, function (err) {
                if (typeof onRejected !== 'function') {
                    return reject(err);
                }
                try {
                    ret = onRejected(err);
                }
                catch (e) {
                    return reject(e);
                }
                resolve(ret);
            });
        });
    };

    /**
     * The Promise/A+ .catch, retister a callback on reject. See: https://promisesaplus.com/
     *
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
     */
    Promise.prototype.catch = function (cb) {
        return this.then(function (result) {
            return result;
        }, cb);
    };

    /**
     * Register a callback on either resolve or reject. See: https://promisesaplus.com/
     *
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
     */
    Promise.prototype.finally = function (cb) {
        return this.then(cb, cb);
    };

    /**
     * Create a promise that is resolved with the given value.
     * If value is already a thenable, it is returned as is.
     * If value is not a thenable, a fulfilled Promise is returned with value as its fulfillment value.
     *
     * @param {Promise|any} obj The value to be resolved.
     * @return {Promise} A thenable which resolves the given `obj`
     * @static
     */
    Promise.resolve = function (obj) {
        return isThenable(obj) ? obj
            : new Promise(function (resolve) {
                return resolve(obj);
            });
    };

    /**
     * Create a promise that is rejected with the given error.
     *
     * @param {Error} err The error to reject with.
     * @return {Promise} A thenable which is rejected with the given `error`
     * @static
     */
    Promise.reject = function (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    };

    /**
     * This method is useful for when you want to wait for more than one promise to complete.
     *
     * Given an Iterable(arrays are Iterable), or a promise of an Iterable,
     * which produces promises (or a mix of promises and values),
     * iterate over all the values in the Iterable into an array and return a promise that is fulfilled when
     * all the items in the array are fulfilled.
     * The promise's fulfillment value is an array with fulfillment values at respective positions to the original array.
     * If any promise in the array rejects, the returned promise is rejected with the rejection reason.
     *
     * @param {Iterable<any>|Promise<Iterable<any>>} promises The promises to wait for.
     * @return {Promise} A thenable.
     * @static
     */
    Promise.all = function (promises) {
        return new Promise(function (resolve, reject) {
            var results = promises.map(function () {
                return undefined;
            });
            var count = promises.length;
            promises
                .map(Promise.resolve)
                .forEach(function (promise, idx) {
                    promise.then(function (result) {
                        results[idx] = result;
                        count--;
                        flush();
                    }, reject);
                });

            // case for empty array
            flush();

            function flush() {
                if (count <= 0) {
                    resolve(results);
                }
            }
        });
    };

    /**
     * Promisify callback
     *
     * @param {Function} resolver The callback to promisify
     * @return {Promise} that is resolved by a node style callback function. This is the most fitting way to do on the fly promisification when libraries don't expose classes for automatic promisification.
     */
    Promise.fromCallback = function (resolver) {
        return new Promise(function (resolve) {
            resolver(function (arg) {
                resolve(arg);
            });
        });
    };

    /**
     * Call functions in serial until someone rejected.
     *
     * @static
     * @param {Array} iterable the array to iterate with.
     * @param {Array} iteratee returns a new promise. The iteratee is invoked with three arguments: (value, index, iterable).
     * @return {Promise} the promise resolves when the last is completed
     */
    Promise.mapSeries = function (iterable, iteratee) {
        var ret = Promise.resolve('init');
        var result = [];
        iterable.forEach(function (item, idx) {
            ret = ret
                .then(function () {
                    return iteratee(item, idx, iterable);
                })
                .then(function (x) {
                    return result.push(x);
                });
        });
        return ret.then(function () {
            return result;
        });
    };

    function mkRejectionEvent(promise) {
        assert(promise._state === REJECTED, UNHANDLED_REJECTION_EVENT_MSG);
        var RejectionEvent;
        if (typeof window.PromiseRejectionEvent === 'function') {
            RejectionEvent = window.PromiseRejectionEvent;
        }
        else {
            RejectionEvent = CustomEvent;
        }
        var event = new RejectionEvent('unhandledrejection', {
            promise: promise,
            reason: promise._result
        });
        event.reason = event.reason || promise._result;
        return event;
    }

    function isThenable(obj) {
        return obj && typeof obj.then === 'function';
    }

    return Promise;
});
