define(function() {
    var service = require('sfr/service');

    //create index service
    var indexService = service.create();
    var $page;

    indexService.prototype.create = function() {
        console.log('[index] create');
        $page = $('#page-index');
    };

    indexService.prototype.attach = function() {
        console.log('[index] attach');
        $page.show();
    };

    indexService.prototype.detach = function() {
        console.log('[index] detach');
        // 首页同步渲染，不会调用 create
        $page = $('#page-index');
        $page.hide();
    };

    indexService.prototype.destroy = function() {
        console.log('index destroy');
    };

    return indexService;
});
