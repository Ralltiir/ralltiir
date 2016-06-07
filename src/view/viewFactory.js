define(function(){   
    
    var viewMap = {};
    
    var View = require('./view.js');

    function create(key, options){

        var options = options || {};

        if(typeof(key) != 'undefined'){

            options.key = key;

            if(viewMap[key]){
                return viewMap[key];
            }else{
                viewMap[key] = new View(options);
                return viewMap[key];
            }
        }
        var view = new View(options);
        return view;
    }

    function destroy(key) {
        delete viewMap[key];
    }

    return {
        create : create,
        destroy : destroy
    }
});
