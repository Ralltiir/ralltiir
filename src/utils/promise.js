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
        this._state = 'init'; // Enum: init, fulfilled, rejected
        this._errors = [];
        this._results = [];

        // 标准：Promises/A+ 2.2.4, see https://promisesaplus.com/ 
        // In practice, this requirement ensures that 
        //   onFulfilled and onRejected execute asynchronously, 
        //   after the event loop turn in which then is called, 
        //   and with a fresh stack.
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
        if (this._state === 'fulfilled') {
            //console.log(this._state);
            this._callHandler(cb, this._results);
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
            this._callHandler(cb, this._errors);
        } else {
            this._handlers.push({
                type: 'catch',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 注册Promise最终的回调
     * @param cb 回调函数
     */
    Promise.prototype.finally = function(cb) {
        if (this._state === 'fulfilled') {
            this._callHandler(cb, this._results);
        } else if (this._state === 'rejected') {
            this._callHandler(cb, this._errors);
        } else {
            this._handlers.push({
                type: 'finally',
                cb: cb
            });
        }
    };
    /*
     * 返回一个成功的Promise
     * @param obj 被解析的对象
     */
    Promise.resolve = function(obj) {
        var args = arguments;
        return _isThenable(obj) ? obj :
            new Promise(function(resolve, reject) {
                return resolve.apply(null, args);
            });
    };
    /*
     * 返回一个失败的Promise
     * @param obj 被解析的对象
     */
    Promise.reject = function(obj) {
        var args = arguments;
        return new Promise(function(resolve, reject) {
            return reject.apply(null, args);
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
                state = 'fulfilled';
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
        if (_isThenable(obj)) {
            return obj
                .then(this._onFulfilled.bind(this))
                .catch(this._onRejected.bind(this));
        }

        this._results = arguments;
        var handler = this._getNextHandler('then');
        if (handler) {
            return this._callHandler(handler, this._results);
        }
        handler = this._getNextHandler('finally');
        if (handler) {
            return this._callHandler(handler, this._results);
        }
        this._state = 'fulfilled';
    };
    Promise.prototype._onRejected = function(err) {
        //console.log('_onRejected', err);
        this._errors = arguments;
        var handler = this._getNextHandler('catch');
        if (handler) {
            return this._callHandler(handler, this._errors);
        }
        handler = this._getNextHandler('finally');
        if (handler) {
            return this._callHandler(handler, this._errors);
        }
        this._state = 'rejected';
    };
    Promise.prototype._callHandler = function(handler, args) {
        //console.log('calling handler', handler, args);
        var result, err = null;
        try {
            result = handler.apply(null, args);
        } catch (e) {
            err = e;
        }
        if (err) {
            this._onRejected(err);
        } else {
            this._onFulfilled(result);
        }
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
