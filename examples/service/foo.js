define(['sfr'], function() {
    var sfr = require('sfr');
    var fooService = new sfr.service();

    fooService.create = function() {
        console.log('[fooService] create');

        this.el = document.createElement('div');
        this.el.innerHTML = [
            '<p>This is foo service!</p>',
            '<a data-sf-href="/">To Index Service</a>'
        ].join('\n');
        sfr.doc.appendChild(this.el);
    };

    fooService.attach = function() {
        console.log('[fooService] attach');
    };

    fooService.detach = function() {
        console.log('[fooService] detach');
    };

    fooService.destroy = function() {
        this.el.remove();
        console.log('[fooService] destroy');
    };

    return fooService;
});

