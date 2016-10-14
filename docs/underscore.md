# Underscore API

## Underscore#keysIn(object)

Creates an array of the own and inherited enumerable property names of object.

**Parameters**

Name | Type | Description
---  | ---  | ---
object | `Object` | The object to query.


## Underscore#forOwn(object, iteratee)

Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property.
The iteratee is invoked with three arguments: (value, key, object).
Iteratee functions may exit iteration early by explicitly returning false.

**Parameters**

Name | Type | Description
---  | ---  | ---
object | `Object` | The object to iterate over.
iteratee | `Function` | The function invoked per iteration.


## Underscore#toArray(value)

Converts value to an array.

**Parameters**

Name | Type | Description
---  | ---  | ---
value | `any` | The value to convert.


## Underscore#forEach(collection, iteratee)

Iterates over elements of collection and invokes iteratee for each element.
The iteratee is invoked with three arguments: (value, index|key, collection).

**Parameters**

Name | Type | Description
---  | ---  | ---
collection | <code>Array&#124;Object</code> | The collection to iterate over.
iteratee | `Function` | The function invoked per iteration.


## Underscore#map(collection, iteratee)

Creates an array of values by running each element in collection thru iteratee.
The iteratee is invoked with three arguments: (value, index|key, collection).

**Parameters**

Name | Type | Description
---  | ---  | ---
collection | <code>Array&#124;Object</code> | The collection to iterate over.
iteratee | `Function` | The function invoked per iteration.


## Underscore#slice(collection, start, end)

Creates a slice of array from start up to, but not including, end.

**Parameters**

Name | Type | Description
---  | ---  | ---
collection | `Array` | The array to slice.
start | `Number` | The start position.
end | `Number` | The end position.


## Underscore#splice(collection)

This method is based on JavaScript Array.prototype.splice



## Underscore#split(str)

This method is based on JavaScript String.prototype.split



## Underscore#format(fmt)

The missing string formatting function for JavaScript.

**Parameters**

Name | Type | Description
---  | ---  | ---
fmt | `String` | The format string (can only contain "%s")
**Example**

```
format("foo%sfoo", "bar");   // returns "foobarfoo"
```


## Underscore#defaults()

Assigns own and inherited enumerable string keyed properties of source objects to
the destination object for all destination properties that resolve to undefined.
Source objects are applied from left to right.
Once a property is set, additional values of the same property are ignored.

**Parameters**

Name | Type | Description
---  | ---  | ---
object | `Object` | The destination object.
sources | `...Object` | The source objects.


## Underscore#isObject(value)

Checks if value is the language type of Object.
(e.g. arrays, functions, objects, regexes, new Number(0), and new String(''))

**Parameters**

Name | Type | Description
---  | ---  | ---
value | `any` | The value to check.


## Underscore#isString(value)

Checks if value is classified as a String primitive or object.

**Parameters**

Name | Type | Description
---  | ---  | ---
value | `any` | The value to check.


## Underscore#defaultsDeep()

This method is like `_.defaults` except that it recursively assigns default properties.

**Parameters**

Name | Type | Description
---  | ---  | ---
object | `Object` | The destination object.
sources | `...Object` | The source objects.


## Underscore#fromPairs(pairs)

The inverse of `_.toPairs`; this method returns an object composed from key-value pairs.

**Parameters**

Name | Type | Description
---  | ---  | ---
pairs | `Array` | The key-value pairs.


## Underscore#isArray(value)

Checks if value is classified as an Array object.

**Parameters**

Name | Type | Description
---  | ---  | ---
value | `any` | The value to check.


## Underscore#isEmpty(value)

Checks if value is an empty object, collection, map, or set.
Objects are considered empty if they have no own enumerable string keyed properties.

**Parameters**

Name | Type | Description
---  | ---  | ---
value | `any` | The value to check.


## Underscore#negate(predicate)

Creates a function that negates the result of the predicate func.
The func predicate is invoked with the this binding and arguments of the created function.

**Parameters**

Name | Type | Description
---  | ---  | ---
predicate | `Function` | The predicate to negate.


## Underscore#partial(func)

Creates a function that invokes func with partials prepended to the arguments it receives.
This method is like `_.bind` except it does not alter the this binding.

**Parameters**

Name | Type | Description
---  | ---  | ---
func | `Function` | The function to partially apply arguments to.
partials | `...any` | The arguments to be partially applied.


## Underscore#partialRight(func)

This method is like `_.partial` except that partially applied arguments are appended to the arguments it receives.

**Parameters**

Name | Type | Description
---  | ---  | ---
func | `Function` | The function to partially apply arguments to.
partials | `...any` | The arguments to be partially applied.


