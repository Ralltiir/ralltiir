/**
 * @file service.js service base class, service base lifecycle
 * @author taoqingqian01
 * @module service
 */

define(function () {

    /**
     * a base/sample  service instance
     *
     * @constructor
     * @alias module:service
     */
    var service = function () {};

    /**
     * Called when service created
     *
     * @example
     * function(){
     *     // do initialization here
     *     this.onClick = function(){};
     * }
     */
    service.prototype.create = function () {};

    /**
     * Called when service attached
     *
     * @example
     * function(){
     *     // do stuff on global click
     *     $(window).on('click', this.onClick);
     * }
     */
    service.prototype.attach = function () {};

    /**
     * Called when service dettached
     *
     * @example
     * function(){
     *     // remove global listeners
     *     $(window).off('click', this.onClick);
     * }
     */
    service.prototype.detach = function () {};

    /**
     * Called when service destroy requested
     *
     * @example
     * function(){
     *     this.onClick = null;
     * }
     */
    service.prototype.destroy = function () {};

    /**
     * Called when service update requested
     *
     * @example
     * function(){
     *     // you may want to redraw your layout
     *     var rect = calcLayoutRect();
     *     this.redraw(rect);
     * }
     */
    service.prototype.update = function () {};

    return service;
});
