define(['sfr'], function() {
    var sfr = require('sfr');
    var indexService = new sfr.service();

    indexService.create = function() {
        this.el = document.createElement('div');
        this.el.innerHTML = [
            '<p>Click these entries:</p>',
            '<ul>',
            '  <li><a data-sf-href="/todos/527">Todo 527</a></li>',
            '  <li><a data-sf-href="/lists/238">List 238</a></li>',
            '</ul>'
        ].join('\n');
        sfr.doc.appendChild(this.el);
    };

    indexService.destroy = function() {
        this.el.remove();
    };

    return indexService;
});
