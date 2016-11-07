define(function() {
    var View = require('sfr/view');
    var action = require('sfr/action');

    var IndexView = new View();

    var style = [
        '.todolists{',
        '    font-size: 0.24rem;',
        '    margin-top: 30px;',
        '}',
        '.todolists li{',
        '    margin-bottom: 10px;',
        '    list-style-type: none;',
        '}'
    ];

    IndexView.create = function($parent) {
        var $style = $('<style>').html(style);
        this.$container = $('<ul class="todolists">')
            .append($style)
            .appendTo($parent)
            .hide();
    };

    IndexView.render = function(todolists, opts) {
        var $container = this.$container;
        todolists.forEach(function(todolist) {
            var $a = $('<a>')
                .data('sf-href', '/todolist/' + todolist.id)
                .html(todolist.text);
            $('<li>').append($a).appendTo($container);
        });
    };

    IndexView.attach = function(){
        this.$container.show();
    };

    IndexView.detach = function(){
        this.$container.hide();
    };

    IndexView.destroy = function() {
        this.$container.remove();
    };

    return IndexView;
});
