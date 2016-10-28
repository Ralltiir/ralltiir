define(function() {

	var View = require('sfr/view');
	var action = require('sfr/action');

    var view = new View();

    view.create = function() {
	    var _this = this;

        _this.$superFra_this = $('#super-fra_this');

        if (!_this.$superFra_this.length) {
            _this.$superFra_this = $('<div id="super-fra_this"></div>');
            $('body').append(_this.$superFra_this);
        }
    };

    /*
     *  View render is the core function that your view should override
     */
    view.render = function(todolist, opts) {
        var _this = this;

        if(_this.$view && _this.$view.length > 0) {
            return;
        }

        var html = [
            '<div>',
            '  <nav>',
            '    <a href="#" class="back">Back</a>',
            '  </nav>',
            '  <div class="body">',
            '    <ul class="todolist"></ul>',
            '  </div>',
            '</div>'
        ].join('\n');

        var $html = $(html);
        var $list = $html.find('.todolist');

        todolist.forEach(function(todo){
            $('<li>')
                .html(todo.text)
                .data('id', todo.id)
                .appendTo($list);
        });

        _this.$view = $html;
        _this.$superFra_this.append(_this.$view);
	};

    /*
     * View attach, bind so_this events
     * record state, TODO
     */
    view.attach =  function() {
        var _this = this;

        _this.$view.find('.back').on('click', function(e) {
        	action.back();
            e.preventDefault();
        });
    };

    /*
     * View destroy
     */
	view.destroy = function() {
	    var _this = this;

        _this.$view.find('.back').off('click');
        _this.$view.remove();
        _this.$view = null;
	};

	return view;
});
