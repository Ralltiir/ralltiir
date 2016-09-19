/**
 *  @file View工厂类，对view实例进行管理
 *  @author taoqingqian01@baidu.com
 * */
define(function(){   
    
    var viewMap = {};
    
    var View = require('./view');

    var Cache = require('./cache');

    Cache.create('View');

    function create(key, options){
        options = options || {};

        if(typeof(key) != 'undefined'){

            options.key = key;

            if(viewMap[key]){
                return viewMap[key];
            } else if(Cache.get('View', key)){
                viewMap[key] = Cache.get('View', key);
                return viewMap[key];
            } else{
                viewMap[key] = new View(options);
                Cache.set('View', key, viewMap[key]);
                return viewMap[key];
            }
        }
        var view = new View(options);
        return view;
    }

    function get(key) {
        if(typeof(key) != 'undefined'){
            return viewMap[key];
        } else {
            return false;
        }
    }

    function destroy(scope) {
        var key = scope.from.url;
        var view = Cache.get('View', key);
        delete viewMap[key];
        if(scope.from.options && scope.from.options.view._hold !== 1) {
            //清除cache
            Cache.remove('View', key);
        }
        return view && view.destroy(scope);
    }

    function clear(){
        viewMap = {};
    }

    return {
        create : create,
        get : get,
        destroy : destroy,
        clear: clear
    };
});
