define(function () {
    var service = require('service');
    var sfView = require('view/sfView');
    var sfResource = require('resource/sfResource');

  	//create sf service
    var sfService = service.create();

    sfService.prototype.create = function(current, prev) {
        // init view
        sfView.create();
        console.log('page create');
    };

    sfService.prototype.attach = function(current, prev) {
        // fetch data and render view
        var data = sfResource.query();
        var opt = {};
        sfView.render(data, opt);
        // attach view
        sfView.attach();
        console.log('page attach');
    };
    
    sfService.prototype.detach = function() {
        console.log('page detach');
    };
    
    sfService.prototype.destroy = function() {
        // destroy view
        sfView.destroy();
        console.log('page destroy');
    };
    
    return sfService;
})