define(function () {
    var service = require('service');
    
    //create index service
    var indexService = service.create();

    indexService.prototype.create = function() {
        var $view = $('#sfa-page');
        $view.length && $view.css({'display': 'block'});
        console.log('index create');
    };

    indexService.prototype.attach = function() {
        console.log('index attach');
    };
    
    indexService.prototype.detach = function() {
        var $view = $('#sfa-page');
        $view.length && $view.css({'display': 'none'});
        console.log('index detach');
    };
    
    indexService.prototype.destroy = function() {
        console.log('index destroy');
    };

    return indexService;
})