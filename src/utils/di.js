// Declare DI object in top level scope
var di = {};

! function() {
    var container = di.container = {};

    /*
     * Register a service
     * @param {String} name the name of your service
     * @param {Function} Constructor the constructor of your service
     * @return {Object} di
     */
    di.service = function(name, Constructor) {
        return defineLazyProperty(name, function(){
            return new Constructor();
        });
    };

    /*
     * Register a factory
     * @param {String} name the name of your factory
     * @param {Function} factory the factory function
     * @return {Object} di
     */
    di.factory = function(name, factory) {
        return defineLazyProperty(name, factory);
    };

    /*
     * Register a provider
     * @param {String} name the name of your provider
     * @param {Function} Provider the constructor of your provider
     * @return {Object} di
     */
    di.provider = function(name, Provider) {
        return defineLazyProperty(name, function(){
            var provider = new Provider();
            return provider.$get();
        });
    };

    /**
     * Register a value
     *
     * @param {String} name the name of your value
     * @param {any} val the value you want to provide with
     * @return {Object} di
     */
    di.value = function(name, val) {
        return defineLazyProperty(name, function(){
            return val;
        });
    };

    /*
     * Define a lazy property for container,
     * The value will be cached after the first run.
     * @param {String} name the name of your property
     * @param {Function} getter the getter of your property
     * @return {Object} di
     * @private
     */
    function defineLazyProperty(name, getter){
        Object.defineProperty(container, name, {
            configurable: true,
            get: function() {
                var obj = getter(container);
                Object.defineProperty(container, name, {
                    configurable: false,
                    writable: false,
                    enumerable: true,
                    value: obj
                });
                return obj;
            }
        });
        return di;
    }
}();
