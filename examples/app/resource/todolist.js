define(function() {
    var Promise = require('sfr').Promise;

    var id = 0;

    function TodoList() {
        this.id = id++;
        var random = Math.random().toString(36).substr(2, 5);
        this.text = 'todolist-' + id + ': ' + random;
    }

    function makeTodoList() {
        return new TodoList();
    }

    TodoList.query = function(opt) {
        return new Promise(function(resolve, reject){
            // mock async process
            setTimeout(function(){
                resolve([1, 2, 3, 4, 5].map(makeTodoList));
            }, 1000)
        });
    };

    return TodoList;
});
