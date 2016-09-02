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
    
    service.prototype.create = function() {};
    service.prototype.attach = function() {};
    service.prototype.detach = function() {};
    service.prototype.destroy = function() {};
    service.prototype.update = function() {};
    
    /**
     *  create a new service class
     *  @params null
     *  @return service class
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
