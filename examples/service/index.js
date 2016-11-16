define(['sfr'], function() {
    var sfr = require('sfr');
    var indexService = new sfr.service();

    indexService.create = function() {
        console.log('[indexService] create');

        this.el = document.createElement('div');
        this.el.innerHTML = [
            '<p>This is index service!</p>',
            '<a data-sf-href="/foo">To Foo Service</a>'
        ].join('\n');
        sfr.doc.appendChild(this.el);
    };

    indexService.attach = function() {
        console.log('[indexService] attach');
    };

    indexService.detach = function() {
        console.log('[indexService] detach');
    };

    indexService.destroy = function() {
        this.el.remove();
        console.log('[indexService] destroy');
    };

    return indexService;
});
