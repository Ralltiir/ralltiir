define(function() {

    var router = require('router/router');
    var exports = {};
    var serviceMap = {};
    var _options = {};
    var indexUrl;

    /**
     *  regist service,a service will work when it is registed
     *  @params name, service
     *  @return null
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
     *  judge service
     *  @params service
     *  @return boolean
     * */
    function isService(service) {
        //todo check service api
        if(typeof service === 'object' 
                && service.create 
                && service.attach 
                && service.detach 
                && service.destroy 
                && service.update) {
            return true;
        } else {
            return false;
        }

    }

    /**
     *  dispatch service
     *  if current and prev is the same service,prev service will not excute destroy function.
     *  @params current scope,prev scope
     *  @return null
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
            return;
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
     *  proxy deferred function,return a deferred object if function no a deferred 
     *  @return object{push,excute}
     * */
    function _MethodProxy() {
        var list = [];

        function excute() {
            deferred = $.Deferred();
            deferred.resolve();
            $.each(list, function() {
                var callback = this;
                deferred = deferred.then(function() {
                    return callback();
                });
            });
            list = [];
            return deferred;
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
     *  remove service
     *  @params name
     * */
    exports.remove = function(name) {
        if(serviceMap.hasOwnProperty(name)) {
            delete serviceMap[name];
        }
    };

    /**
     *  is service regist
     * */
    exports.exist = function(name) {
        return serviceMap.hasOwnProperty(name);
    };

    /**
     *  clear all service
     * */
    exports.clear = function(){
        serviceMap = {};
    };

    /**
     *  redirect page to another, change to next state
     *  @params url,query,options
     *  @return null
     * */
    exports.redirect = function(url, query, options) {
        router.redirect(url, query, options);
    };

    /**
     *  back to last state
     *  @params url,query,options
     *  @return null
     * */
    exports.back = function(options) {
        _options.src = 'back';
        history.back(); 
    };

    /**
     *  reset/replace now state
     *  @params url,query,options
     *  @return null
     * */
    exports.reset = function(url, query, options) {
        router.reset(url, query, options);
    };

    /**
     *  hijack global link href
     *  @inner
     *  @params {Event} 
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
     *  action init
     * */
    exports.start = function() {
        $(document).delegate('a', 'click', _delegateClick);
    } ;

    /**
     *  config action options
     * */
    exports.config = function(options) {
        $.extend(_options, options);
        return _options;
    };

    /**
     *  update page, reset/replace now state
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
            serviceMap.update({
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
