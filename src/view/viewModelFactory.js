define(function(){   
    var viewMap = {};
    var viewModel = function(options){
        var self = this;
        self.hashId = parseInt(Math.random()*(new Date().getTime()));
        self.containerId = self.hashId;
        self.container = document.createElement('div');
        self.container.setAttribute('id',self.containerId);
        self.wrapper = options.container;
        self.wrapper.html(self.container);
        self.key = options.key;
        //一个情景的全局信息
        self.global = {};
        self.data = "";
        self.hold = options.hold;
        self.global.container = self.container;
        self._render = require('./sfRender');
        return self;    
    };

    var action = require('../action');
    
    var Cache = require('./cache.js');

    Cache.create('ViewModel');

    viewModel.prototype.fetch = function(url, path){
       
        var conf = {};
        var reg = new RegExp('^' + path);    // TODO: escapeRegExp(path)
        var config = action.config();

        var fetchUrl = config.fetch && config.fetch[path] ? config.fetch[path].url : path;

        conf.url = url.replace(reg, fetchUrl);
        conf.withCredentials = config.fetch && config.fetch[path] && config.fetch[path].withCredentials;

        conf.dataType = 'text';
        var dtd = $.Deferred();
        var self = this;

        $.ajax(conf).done(function(data){
            self.data = data; 
            dtd.resolve();
        });
        return dtd;
    };
    
    viewModel.prototype.render = function(){
        var dtd = $.Deferred();
        var renderedAndCached = Cache.get('ViewModel', this.key) && this.rendered;
        if(!renderedAndCached) {
            this._render(this.data,this.global);
            this.rendered = true;
        }
        dtd.resolve();
        return dtd;
    };

    viewModel.prototype.start = function(scope){
        this.global.view && this.global.view.trigger('start');
    };
    
    viewModel.prototype.stop = function(scope){
        this.global.view && this.global.view.trigger('stop');
    };
    
    viewModel.prototype.destroy = function(scope){
        if(!(scope && scope.from.options && scope.from.options.view._hold === 1)) {
            this.global && this.global.view && this.global.view.trigger('destroy');
            this.container && this.container.remove && this.container.remove("#"+this.hashId);
            this.global = null;
            this.container = null;
            this.data = null;
            delete viewMap[this.key];
            Cache.remove('ViewModel', this.key);
        }
    };

    function get(key) {
        if(typeof(key) != 'undefined'){
            return viewMap[key];
        } else {
            return false;
        }
    }

    function create(key, options){

        options = options || {};

        if(typeof(key) != 'undefined'){

            options.key = key;

            if(viewMap[key]){
                return viewMap[key];
            } else if(Cache.get('ViewModel', key)){
                viewMap[key] = Cache.get('ViewModel', key);
                return viewMap[key];
            } else{
                var view = new viewModel(options);
                viewMap[key] = view;
                Cache.set('ViewModel', key, view);
                return view;
            }
        }
    }

    function clear(){
        viewMap = {};
    }

    return {
        create : create,
        get : get,
        clear: clear
    };
});
