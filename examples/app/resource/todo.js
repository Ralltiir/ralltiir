define(function() {
    var Resource = require('sfr/resource');

    var Todo = new Resource();
    var id = 0;

    function makeTodo() {
        return {
            id: id++,
            text: 'Todo-' + Math.random().toString(36).substr(2)
        };
    }

    Todo.query = function(opt) {
        return new Promise(function(resolve, reject){
            // mock async process
            setTimeout(function(){
                var todolist = [1, 2, 3, 4, 5].map(makeTodo);
                resolve(todolist);
            }, 1000);
        });
    };

    return Todo;
});
