# Promise API

## new Promise(cb)

Create a new promise.
The passed in function will receive functions resolve and reject as its arguments
which can be called to seal the fate of the created promise.

The returned promise will be resolved when resolve is called, and rejected when reject called or any exception occurred.
If you pass a promise object to the resolve function, the created promise will follow the state of that promise.

> This implementation conforms to Promise/A+ spec. see: https://promisesaplus.com/

**Parameters**

Name | Type | Description
---  | ---  | ---
cb | `Function(function resolve, function reject)` | The resolver callback.
**Example**

```
var p = new Promise(function(resolve, reject){
    true ? resolve('foo') : reject('bar');
});
```


## Promise#then(cb)

The Promise/A+ .then, register a callback on resolve. See: https://promisesaplus.com/

**Parameters**

Name | Type | Description
---  | ---  | ---
cb | `Function` | The callback to be registered.


## Promise#catch(cb)

The Promise/A+ .catch, retister a callback on reject. See: https://promisesaplus.com/

**Parameters**

Name | Type | Description
---  | ---  | ---
cb | `Function` | The callback to be registered.


## Promise#finally(cb)

The Promise/A+ .catch, register a callback on either resolve or reject. See: https://promisesaplus.com/

**Parameters**

Name | Type | Description
---  | ---  | ---
cb | `Function` | The callback to be registered.


## Promise.resolve(obj)

Create a promise that is resolved with the given value.
If value is already a thenable, it is returned as is.
If value is not a thenable, a fulfilled Promise is returned with value as its fulfillment value.

**Parameters**

Name | Type | Description
---  | ---  | ---
obj | <code>Promise&lt;any&gt;&#124;any value</code> | The value to be resolved.


## Promise.reject()

Create a promise that is rejected with the given error.

**Parameters**

Name | Type | Description
---  | ---  | ---
error | `Error` | The error to reject with.


## Promise.all(promises)

This method is useful for when you want to wait for more than one promise to complete.

Given an Iterable(arrays are Iterable), or a promise of an Iterable,
which produces promises (or a mix of promises and values),
iterate over all the values in the Iterable into an array and return a promise that is fulfilled when
all the items in the array are fulfilled.
The promise's fulfillment value is an array with fulfillment values at respective positions to the original array.
If any promise in the array rejects, the returned promise is rejected with the rejection reason.

**Parameters**

Name | Type | Description
---  | ---  | ---
promises | <code>Iterable&lt;any&gt;&#124;Promise&lt;Iterable&lt;any&gt;&gt;</code> | The promises to wait for.


