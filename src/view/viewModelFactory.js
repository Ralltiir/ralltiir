define(function(){   
    var viewMap = {};
    var viewModel = function(options){
        var self = this;
        self.hashId = parseInt(Math.random()*(new Date().getTime()));
        self.containerId = self.hashId;
        self.container = document.createElement('div');
        self.container.setAttribute('id',self.containerId);
        self.wrapper = options.container;
        self.wrapper.append(self.container);
        self.key = options.key;
        //一个情景的全局信息
        self.global = {};
        self.data = "";
        self.hold = options.hold;
        self.global.container = self.container;
        self._render = require('./sfRender');
        return self;    
    }

    viewModel.prototype.fetch = function(url){
            
       var conf = {};
       conf.url = url;
       conf.dataType = 'text';
        var dtd = $.Deferred();
        var self = this;
        $.ajax(conf).done(function(data){
            //console.log(data);
          self.data = data; 
            dtd.resolve();
        });
        return dtd;
    };
    
    viewModel.prototype.render = function(){
          var dtd = $.Deferred;    
          this._render(this.data,this.global);
          dtd.resolve;
          return dtd;
    };
    
    viewModel.prototype.destroy = function(){
        if(!this._hold) {
            this.global.view && this.global.view.trigger('destroy');
            this.container.remove("#"+this.hashId);
            this.global = null;
            this.container = null;
            this.data = null;
            delete viewMap[this.key];
        }
    };

    function create(key, options){

        var options = options || {};

        if(typeof(key) != 'undefined'){

            options.key = key;

            if(viewMap[key]){
                return viewMap[key];
            }else{
                viewMap[key] = new viewModel(options);
                return viewMap[key];
            }
        }
        var view = new viewModel(options);
        return view;
    }
    return {create:create}
});
