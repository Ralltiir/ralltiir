define(function() {
    var View = require('sfr/view');
    var action = require('sfr/action');

    var TodoListView = new View();
    var html = [
        '<div>',
        '  <ul class="todolist"></ul>',
        '</div>'
    ].join('');
    var style = [
        '.todolist{',
        '    font-size: 0.24rem;',
        '    margin: 30px auto;',
        '}',
        '.todolist li{',
        '    margin-bottom: 10px;',
        '    list-style-type: none;',
        '}'
    ].join('');

    TodoListView.create = function($parent) {
        var $style = $('<style>').html(style);
        this.$container = $(html)
            .append($style)
            .appendTo($parent)
            .hide();
        this.$list = this.$container.find('.todolist');
    };

    TodoListView.render = function(todolist, opts) {
        var $list = this.$list;
        todolist.forEach(function(todo) {
            $('li')
                .html(todo.text)
                .data('id', todo.id)
                .appendTo($list);
        });
    };

    TodoListView.attach = function() {
        this.$container.show();
    };

    TodoListView.detach = function() {
        this.$container.hide();
    };

    TodoListView.destroy = function() {
        this.$container.remove();
    };

    return TodoListView;
});
