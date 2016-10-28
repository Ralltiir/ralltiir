define(function() {

    /*
     * Create a new view instance
     * @constructor
     */
    var View = function () {
        this._init();
    };

    View.prototype = {

        _init: function() {},

        /**
         * Initialize properties
         * */
        set: function() {},
        
        /*
         * Get properties
         */
        get: function() {},

        /*
         * Called when view created
         */
        create: function() {},

        /**
         *  Render the DOM, called when render requested. Override this to render your HTML
         * */
        render: function() {},

        /**
         *  Update the view, called when update requested. Override this to update or re-render your HTML.
         * */
        update : function() {},

        /*
         * Callback when view attached to DOM
         */
        attach: function() {},

        /*
         * Callback when view detached from DOM
         */
        detach : function() {},

        /**
         * Destroy the view, called when destroy requested.
         * */
        destroy: function() {},

        /**
         * Bind an event to the view.
         * @param {String} name The name of the event
         * @param {Function} callback The callback when the event triggered
         * */
        on: function(name, callback) {},

        /**
         * Unbind the given event
         * @param {String} name The event name to unbind
         * */
        off: function(name) {}
    };

    return View;
});
