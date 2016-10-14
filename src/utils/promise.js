define(function() {
    /*
     * Create a new promise. 
     * The passed in function will receive functions resolve and reject as its arguments 
     * which can be called to seal the fate of the created promise.
     * 
     * The returned promise will be resolved when resolve is called, and rejected when reject called or any exception occurred.
     * If you pass a promise object to the resolve function, the created promise will follow the state of that promise.
     *
     * > This implementation conforms to Promise/A+ spec. see: https://promisesaplus.com/
     * @param {Function(function resolve, function reject)} cb The resolver callback.
     * @return {Promise} A thenable. 
     * @constructor
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
     * The Promise/A+ .then, register a callback on resolve. See: https://promisesaplus.com/
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
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
     * The Promise/A+ .catch, retister a callback on reject. See: https://promisesaplus.com/
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
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
     * 
     * The Promise/A+ .catch, register a callback on either resolve or reject. See: https://promisesaplus.com/
     * @param {Function} cb The callback to be registered.
     * @return {Promise} A thenable.
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
     * Create a promise that is resolved with the given value. 
     * If value is already a thenable, it is returned as is. 
     * If value is not a thenable, a fulfilled Promise is returned with value as its fulfillment value.
     * @param {Promise<any>|any value} obj The value to be resolved.
     * @return {Promise} A thenable which resolves the given `obj`
     * @static
     */
    Promise.resolve = function(obj) {
        var args = arguments;
        return _isThenable(obj) ? obj :
            new Promise(function(resolve) {
                return resolve.apply(null, args);
            });
    };
    /*
     * Create a promise that is rejected with the given error.
     * @param {Error} error The error to reject with.
     * @return {Promise} A thenable which is rejected with the given `error`
     * @static
     */
    Promise.reject = function() {
        var args = arguments;
        return new Promise(function(resolve, reject) {
            return reject.apply(null, args);
        });
    };
    /*
     * This method is useful for when you want to wait for more than one promise to complete.
     *
     * Given an Iterable(arrays are Iterable), or a promise of an Iterable, 
     * which produces promises (or a mix of promises and values), 
     * iterate over all the values in the Iterable into an array and return a promise that is fulfilled when 
     * all the items in the array are fulfilled. 
     * The promise's fulfillment value is an array with fulfillment values at respective positions to the original array. 
     * If any promise in the array rejects, the returned promise is rejected with the rejection reason.
     * @param {Iterable<any>|Promise<Iterable<any>>} promises The promises to wait for.
     * @return {Promise} A thenable.
     * @static
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
    Promise.prototype._onRejected = function() {
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
