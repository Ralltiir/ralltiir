# Http API

## Http#ajax(url, settings)

Perform an asynchronous HTTP (Ajax) request.

**Parameters**

Name | Type | Description
---  | ---  | ---
url | `String` | A string containing the URL to which the request is sent.
settings | `Object` | A set of key/value pairs that configure the Ajax request. All settings are optional.
**Example**

```
ajax('/foo')
    .then(function( data, textStatus, xhr ) {});
    .catch(function( xhr, textStatus, errorThrown ) {});
    .finally(function( data|xhr, textStatus, xhr|errorThrown ) { });
```


## Http#get(url, data)

Load data from the server using a HTTP GET request.

**Parameters**

Name | Type | Description
---  | ---  | ---
url | `String` | A string containing the URL to which the request is sent.
data | `Object` | A plain object or string that is sent to the server with the request.


## Http#post(url, data)

Load data from the server using a HTTP POST request.

**Parameters**

Name | Type | Description
---  | ---  | ---
url | `String` | A string containing the URL to which the request is sent.
data | `Object` | A plain object or string that is sent to the server with the request.


## Http#put(url, data)

Load data from the server using a HTTP PUT request.

**Parameters**

Name | Type | Description
---  | ---  | ---
url | `String` | A string containing the URL to which the request is sent.
data | `Object` | A plain object or string that is sent to the server with the request.


## Http#delete(url, data)

Load data from the server using a HTTP DELETE request.

**Parameters**

Name | Type | Description
---  | ---  | ---
url | `String` | A string containing the URL to which the request is sent.
data | `Object` | A plain object or string that is sent to the server with the request.


