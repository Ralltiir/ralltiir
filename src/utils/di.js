define(function() {
    var container = {};
    var di = {
        container: container
    };

    /*
     * Register a service
     * TODO: implementation
     */
    di.service = function(name, impl) {};

    /*
     * Register a factory
     * TODO: implementation
     */
    di.factory = function(name, impl) {};

    /*
     * Register a provider
     * TODO: implementation
     */
    di.provider = function(name, impl) {};

    /**
     * Register a value
     *
     * @param {String} name
     * @param {mixed} val
     * @return {undefined}
     * @return {di}
     */
    di.value = function(name, val) {
        Object.defineProperty(container, name, {
            configurable: true,
            enumerable: true,
            value: val,
            writable: true
        });
        return di;
    };

    return di;
});
