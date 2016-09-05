/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 标准： Promises/A+ https://promisesaplus.com/
 */

define(function() {
    function Promise(cb) {
        if (!(this instanceof Promise)) {
            throw 'Promise must be called with new operator';
        }
        if (typeof cb !== 'function') {
            throw 'callback not defined';
        }

        this._handlers = [];
        this._state = 'init'; // Enum: init, resolved, rejected
        this._error = null;
        this._result = undefined;

        // compliant to Node.js implementation
        setTimeout(function() {
            cb(this._onFulfilled.bind(this), this._onRejected.bind(this));
        }.bind(this));
    }

    /*
     * 注册Promise成功的回调
     * @param cb 回调函数
     */
    Promise.prototype.then = function(cb) {
        //console.log('calling then', this._state);
        if (this._state === 'resolved') {
            console.log(this._state);
            this._callHandler(cb, this._result);
        } else {
            this._handlers.push({
                type: 'then',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 注册Promise失败的回调
     * @param cb 回调函数
     */
    Promise.prototype.catch = function(cb) {
        if (this._state === 'rejected') {
            this._callHandler(cb, this._error);
        } else {
            this._handlers.push({
                type: 'catch',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 返回一个成功的Promise
     * @param obj 被解析的对象
     */
    Promise.resolve = function(obj) {
        return _isThenable(obj) ?  obj :
            new Promise(function(resolve, reject) {
                resolve(obj);
            });
    };
    /*
     * 返回一个失败的Promise
     * @param obj 被解析的对象
     */
    Promise.reject = function(obj) {
        return new Promise(function(resolve, reject) {
            reject(obj);
        });
    };
    /*
     * 返回一个Promise，当数组中所有Promise都成功时resolve，
     * 数组中任何一个失败都reject。
     * @param promises Thenable数组，可以包含Promise，也可以包含非Thenable
     */
    Promise.all = function(promises) {
        var results = promises.map(function() {
            return undefined;
        });
        var count = 0;
        var state = 'pending';
        return new Promise(function(res, rej) {
            function resolve() {
                if (state !== 'pending') return;
                state = 'resolved';
                res(results);
            }

            function reject() {
                if (state !== 'pending') return;
                state = 'rejected';
                rej.apply(null, arguments);
            }
            promises
                .map(Promise.resolve)
                .forEach(function(promise, idx) {
                    promise
                        .then(function(result) {
                            results[idx] = result;
                            count++;
                            if (count === promises.length) resolve();
                        })
                        .catch(reject);
                });
        });
    };

    Promise.prototype._onFulfilled = function(obj) {
        //console.log('_onFulfilled', obj);
        this._waiteThenable(obj, function(result) {
            this._result = result;
            var handler = this._getNextHandler('then');
            return this._callHandler(handler, result);
        }.bind(this));
        this._state = 'resolved';
    };
    Promise.prototype._onRejected = function(obj) {
        //console.log('_onRejected', obj);
        this._waiteThenable(obj, function(err) {
            this._error = err;
            var handler = this._getNextHandler('catch');
            return this._callHandler(handler, err);
        }.bind(this));
        this._state = 'rejected';
    };
    Promise.prototype._callHandler = function(handler, obj) {
        //console.log('calling handler', handler, obj);
        if (!handler) return;
        var result, err = null;
        try {
            result = handler(obj);
        } catch (e) {
            err = e;
        }
        if (err) {
            this._onRejected(err);
        } else {
            this._onFulfilled(result);
        }
    };
    Promise.prototype._waiteThenable = function(obj, cb) {
        //console.log('_waiteThenable', obj, cb, _isThenable(obj));
        return _isThenable(obj) ? obj.then(cb) : cb(obj);
    };
    Promise.prototype._getNextHandler = function(type) {
        var obj;
        while (obj = this._handlers.shift()) {
            if (obj.type === type) break;
        }
        return obj ? obj.cb : null;
    };

    function _isThenable(obj) {
        return obj && typeof obj.then === 'function';
    }

    return Promise;
});
