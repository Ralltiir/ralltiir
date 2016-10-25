/*
 * service base class
 * service base lifecycle
 * create by taoqingqian01
 */

define(function() {

    var exports = {};

    var service = function(options) {
        var me = this;
        me.options = options;
    };
    
    /*
     * Called when service created
     */
    service.prototype.create = function() {};
    /*
     * Called when service attached
     */
    service.prototype.attach = function() {};
    /*
     * Called when service dettached
     */
    service.prototype.detach = function() {};
    /*
     * Called when service destroy requested
     */
    service.prototype.destroy = function() {};
    /*
     * Called when service update requested
     */
    service.prototype.update = function() {};
    
    /**
     *  Create a service class with default lifecycle callbacks
     *  @static
     *  @return {Class} The created service class
     *  @example
     *  var serviceClass = Service.create();
     * */
    exports.create = function() {
        var _class = function() {
            //nothing todo now
        }
        _class.prototype = Object.create(service.prototype);
        return _class;
    };

    return exports;
});
