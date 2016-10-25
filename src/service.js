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
     * @example
     * function(){
     *     // do initialization here
     *     this.onClick = function(){};
     * }
     */
    service.prototype.create = function() {};
    /*
     * Called when service attached
     * @example
     * function(){
     *     // do stuff on global click
     *     $(window).on('click', this.onClick);
     * }
     */
    service.prototype.attach = function() {};
    /*
     * Called when service dettached
     * @example
     * function(){
     *     // remove global listeners
     *     $(window).off('click', this.onClick);
     * }
     */
    service.prototype.detach = function() {};

    /*
     * Called when service destroy requested
     * @example
     * function(){
     *     this.onClick = null;
     * }
     */
    service.prototype.destroy = function() {};

    /*
     * Called when service update requested
     * @example
     * function(){
     *     // you may want to redraw your layout
     *     var rect = calcLayoutRect();
     *     this.redraw(rect);
     * }
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
