define(function() {

    var router = require('router/router');
    var Promise = require('utils/promise');
    var exports = {};
    var serviceMap = {};
    var _options = {};
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
        var methodProxy = new _MethodProxy();
        var currentService = serviceMap[current.path];
        var prevService = serviceMap[prev.path];

        current.options = current.options || {};

        //container init,nothing to do
        if(current.options.src === 'sync') {
            indexUrl = current.url;
            return Promise.resolve();
        }
        
        //set src to current scope
        if(_options.src) {
            current.options.src = _options.src;
        }

        prevService && methodProxy.push(prevService.detach, prevService, current, prev);
        currentService && methodProxy.push(currentService.create, currentService, current, prev);
        //container will not be destroyed
        if(!(prev.url === indexUrl)) {
            prevService && methodProxy.push(prevService.destroy, prevService, current, prev);
        }
        currentService && methodProxy.push(currentService.attach, currentService, current, prev);
        
        //clean options.src
        methodProxy.push(function() {
            _options.src = undefined;
        });

        return methodProxy.excute();
    };

    /**
     *  Proxy deferred function,return a deferred object if function no a deferred 
     *  @static
     *  @return {object} Returns an object containing two methods: `{push,excute}`
     * */
    function _MethodProxy() {
        var list = [];

        function excute() {
            var p = Promise.resolve();
            $.each(list, function() {
                var callback = this;
                p = p.then(function() {
                    return callback();
                });
            });
            list = [];
            return p;
        }

        function push(fn, context) {
            var args = (2 in arguments) && (Array.prototype.slice.call(arguments, 2));
            if(typeof fn === 'function') {
                list.push(function() {return fn.apply(context, args ? args : []) });
            }
        }

        return {
            push : push,
            excute : excute
        };
    }

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
     *  @param {Object} options The router options to redirect
     * */
    exports.back = function(options) {
        _options.src = 'back';
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
    function _delegateClick(e) {
        
        var $target = $(this);

        var link = $target.attr('data-sf-href');

        if(link) {
            //link href only support url like pathname,e.g:/sf?params=
            var options = $target.attr('data-sf-options');

            try {
                options = $.parseJSON(options) ? $.parseJSON(options) : {};
            } catch(err) {
                options = {};
            }

            options = $.extend(options, {"src": "hijack"});

            exports.redirect(link, null, options);

            e.preventDefault();
        }
    }

    /**
     *  Action init, call this to start the action
     *  @static 
     * */
    exports.start = function() {
        $(document).delegate('a', 'click', _delegateClick);
    } ;

    /**
     *  Configure the action.
     *  @static
     *  @param {Object} options The options to config with
     *  @return {Object} The normalized option object
     * */
    exports.config = function(options) {
        $.extend(_options, options);
        return _options;
    };

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
