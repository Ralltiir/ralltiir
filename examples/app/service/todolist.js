define(function() {
    var Service = require('sfr/service');
    var TodoListView = require('view/todolist');
    var Todo = require('resource/todo');
    var ContainerView = require('view/container');

    var TodolistService = new Service();

    TodolistService.create = function(current, prev) {
        console.log('[todolist service] create');

        // Create时立即加载容器
        this.containerView = Object.create(ContainerView);
        this.containerView.create({
            title: 'A Fine Todo List',
            background: 'lightgreen',
            height: '50px'
        });

        this.containerView.attach();

        var view = this.view = Object.create(TodoListView);
        view.create(this.containerView.$body);

        return Todo.query().then(function(todolist) {
            view.render(todolist);
        });
    };

    TodolistService.attach = function(current, prev) {
        console.log('[todolist service] attach');
        this.view.attach();
    };

    TodolistService.detach = function() {
        this.view.detach();
        console.log('[todolist service] detach');
    };

    TodolistService.destroy = function() {
        console.log('[todolist service] destroy');
        this.view.destroy();
        this.containerView.destroy();
    };

    return TodolistService;
});
