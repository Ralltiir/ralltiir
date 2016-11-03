define(function() {

    var router = require('router/router');
    var Promise = require('utils/promise');
    var _ = require('utils/underscore');
    var exports = {};
    var serviceMap = {};
    var indexUrl;

    /**
     *  Register a service instance to action
     *  @static
     *  @param {String} name The path of the service
     *  @param {Object} service The service object to be registered
     *  @return undefined
     *  @example
     *  action.regist('/foo', new Service());
     * */
    exports.regist = function(name, service) {
        if(!name){
            throw new Error('illegal action name');
        } 
        if(!service){
            throw new Error('illegal action option');
        }
        if(!serviceMap.hasOwnProperty(name) && isService(service)) {
            //set service name as a router path.
            router.add(name, this.dispatch);
            serviceMap[name] = service;
        }
    };

    /**
     *  Check if value is a valid service instance
     *  @param {any} value The value to check.
     *  @return {Boolean} Returns true if value is a service, else false.
     * */
    function isService(value) {
        // duck test...
        if(typeof value === 'object' 
                && value.create 
                && value.attach 
                && value.detach 
                && value.destroy 
                && value.update) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *  Switch from the previous service to the current one.
     *  Call prev.detach, prev.destroy, current.create, current.attach in serial.
     *
     *  If any of these callbacks returns a `Thenable`, it'll be await.
     *  If the promise is rejected, the latter callbacks will **NOT** be called.
     *
     *  Returns a promise that 
     *  resolves if all callbacks executed without throw (or reject),
     *  rejects if any of the callbacks throwed or rejected.
     *
     *  Note: If current and prev is the same service,
     *  the `prev.destroy` will **NOT** be called.
     *  @static
     *  @param {Object} current The current scope
     *  @param {Object} prev The previous scope
     *  @return {Promise}
     * */
    exports.dispatch = function(current, prev) {
        var proxyList = [];
        var currentService = serviceMap[current.path];
        var prevService = serviceMap[prev.path];

        current.options = current.options || {};

        return Promise.mapSeries([
            prevService && prevService.detach.bind(prevService),
            currentService && currentService.create.bind(currentService),
            //container will not be destroyed
            prev.url !== indexUrl && prevService && prevService.destroy.bind(prevService),
            currentService && currentService.attach.bind(currentService)
        ], function(cb){
            if(typeof cb !== 'function') return;
            return cb(current, prev);
        }).catch(function(e){
            console.error('Unable to switch service', e.stack);
        });
    };

    /**
     *  Remove a registered service
     *  @static
     *  @param {String} name The path of the service
     * */
    exports.remove = function(name) {
        if(serviceMap.hasOwnProperty(name)) {
            delete serviceMap[name];
        }
    };

    /**
     *  Check if the specified service has been registered
     *  @static
     *  @param {String} name The path of the service
     *  @return {Boolean} Returns true if it has been registered, else false.
     * */
    exports.exist = function(name) {
        return serviceMap.hasOwnProperty(name);
    };

    /**
     *  Clear all registered service
     *  @static
     * */
    exports.clear = function(){
        serviceMap = {};
        router.clear();
    };

    /**
     *  Redirect to another page, and change to next state
     *  @static
     *  @param {String} url The URL to redirect
     *  @param {String} query The query string to redirect
     *  @param {Object} options The router options to redirect
     * */
    exports.redirect = function(url, query, options) {
        router.redirect(url, query, options);
    };

    /**
     *  Back to last state
     *  @static
     * */
    exports.back = function() {
        history.back(); 
    };

    /**
     *  Reset/replace current state
     *  @static
     *  @param {String} url The URL to reset
     *  @param {String} query The query string to reset
     *  @param {Object} options The router options to reset
     * */
    exports.reset = function(url, query, options) {
        router.reset(url, query, options);
    };

    /**
     *  hijack global link href
     *  @private
     *  @param {Event} e The click event object
     * */
    function _onAnchorClick(e, target) {
        //link href only support url like pathname,e.g:/sf?params=
        var link = target.getAttribute('data-sf-href');
        var options = target.getAttribute('data-sf-options');

        if(link) {
            try {
                options = JSON.parse(options) || {};
            } catch(err) {
                options = {};
            }
            options.src = "hijack";
            exports.redirect(link, null, options);

            e.preventDefault();
        }
    }

    function _delegateAnchorClick(cb){
        document.documentElement.addEventListener("click", function(event){
            event = event || window.event;
            var targetEl = _closest(event.target || event.srcElement, "A");
            if (targetEl) {
                cb(event, targetEl);
            }
        }, false);

        function _closest(element, tagName) {
            var parent = element;
            while (parent !== null && parent.tagName !== tagName.toUpperCase()) {
                parent = parent.parentNode;
            }
            return parent;
        }
    }

    /**
     *  Action init, call this to start the action
     *  @static 
     * */
    exports.start = function() {
        _delegateAnchorClick(_onAnchorClick);
    } ;

    /**
     *  Update page, reset or replace current state accordingly
     *  @static
     *  @param {String} url The URL to update
     *  @param {String} query The query string to update
     *  @param {Object} options The router options to update
     *  @param {Object} extend The extended data to update, contains a `container` and `view`
     * */
    exports.update = function(url, query, options, extend) {
        
        options = options ? options : {};
        
        //use silent mode
        if(!options.hasOwnProperty('silent')) {
            options.silent = true;
        }

        var prevUrl = location.href.replace(/.*\/([^/]+$)/,'/$1');

        var name = location.pathname.replace(/.*\/([^/]+$)/,'/$1');

        if(serviceMap.hasOwnProperty(name)) {
            var service = serviceMap[name];
            service.update({
                path: name,
                url: url,
                prevUrl: prevUrl,
                query: query,
                options: options,
                container: extend.container,
                view: extend.view
            });
        }
        
        router.reset(url, query, options);
    };
    
    return exports;
});
