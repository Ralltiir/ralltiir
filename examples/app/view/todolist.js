define(function() {
    var View = require('sfr/view'); 
    var action = require('sfr/action');

    var view = new View();

    view.create = function() {
        container = document.createElement('div');
        container.setAttribute('id', 'todo-page');
        document.body.append(container);
        this.container = container;
    };

    /*
     *  View render is the core function that your view should override
     */
    view.render = function(todolist, opts) {
        var html = [
            '<nav>',
            '  <a href="#" class="back">Back</a>',
            '</nav>',
            '<div class="body">',
            '  <ul class="todolist"></ul>',
            '</div>',
        ].join('\n');

        this.container.innerHTML = html;
        var list = this.container.querySelector('.todolist');

        todolist.forEach(function(todo){
            var li = document.createElement('li');
            li.textContent = todo.text;
            li.setAttribute('id', todo.id);
            list.appendChild(li);
        });
        this.backEl = this.container.querySelector('.back');
	};

    /*
     * View attach, bind some events
     */
    view.attach =  function() {
        this.backEl.addEventListener('click', onBackClick);
    };

    view.detach = function() {
        this.backEl.removeEventListener('click', onBackClick);
    };

    /*
     * View destroy
     */
	view.destroy = function() {
        this.container.remove();
	};

    function onBackClick(e) {
        action.back();
        e.preventDefault();
    }

	return view;
});
