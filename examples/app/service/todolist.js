define(function () {
    var service = require('sfr/service');
    var view = require('view/todolist');
    var Todo = require('resource/todo');

  	//create sf service
    var sfService = service.create();

    sfService.prototype.create = function(current, prev) {
        console.log('[todolist] page create');
        // init view
        view.create();
    };

    sfService.prototype.attach = function(current, prev) {
        // fetch data and render view
        var todolist = Todo.query();
        var opt = {};
        view.render(todolist, opt);
        // attach view
        view.attach();
        console.log('[todolist] attach');
    };
    
    sfService.prototype.detach = function() {
        console.log('[todolist] detach');
    };
    
    sfService.prototype.destroy = function() {
        // destroy view
        view.destroy();
        console.log('[todolist] destroy');
    };
    
    return sfService;
});
