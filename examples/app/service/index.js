define(function() {
    var service = require('sfr/service');

    //create index service
    var indexService = service.create();
    var pageEl;

    indexService.prototype.create = function() {
        console.log('[index] create');
        pageEl = document.querySelector('#page-index');
    };

    indexService.prototype.attach = function() {
        console.log('[index] attach');
        pageEl.style.display = 'block';
    };

    indexService.prototype.detach = function() {
        console.log('[index] detach');
        // 首页同步渲染时不会调用 create，再次初始化
        pageEl = document.querySelector('#page-index');
        pageEl.style.display = 'none';
    };

    indexService.prototype.destroy = function() {
        console.log('index destroy');
    };

    return indexService;
});
