define(function() {
    var Service = require('sfr').service;
    var TodoList = require('resource/todolist');
    var IndexView = require('view/index');
    var ContainerView = require('view/container');

    IndexService = new Service();

    IndexService.create = function() {
        console.log('[index service] create');

        // Create时立即加载容器
        this.containerView = Object.create(ContainerView);
        this.containerView.create({
            title: 'All My Todo Lists',
            background: '#09f',
            height: '44px'
        });
        this.containerView.attach();

        // 开始获取资源
        var self = this;
        return TodoList.query().then(function(todolists) {
            self.indexView = Object.create(IndexView);
            self.indexView.create(self.containerView.$body);
            self.indexView.render(todolists);
        });
    };

    IndexService.attach = function(todolists) {
        console.log('[index service] attach');
        this.indexView.attach();
    };

    IndexService.detach = function() {
        console.log('[index service] detach');
        this.indexView.detach();
    };

    IndexService.destroy = function() {
        console.log('[index service] destroy');

        this.containerView.destroy();
        this.indexView.destroy();
    };

    return IndexService;
});
