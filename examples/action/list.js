define(['sfr'], function() {
    var sfr = require('sfr');
    var todoService = new sfr.service();

    todoService.create = function(options) {
        this.el = document.createElement('div');
        this.el.innerHTML = 
            '<p>This is List ' + options.params.$1 + '!</p>' +
            '<p>Current Path:' + options.path + '</p>' +
            '<p>Current URL:' + options.url + '</p>';
        sfr.doc.appendChild(this.el);
    };

    todoService.destroy = function() {
        this.el.remove();
    };

    return todoService;
});

