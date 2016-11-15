define('hello-world', ['sfr'], function() {
    var sfr = require('sfr');
    var helloWorldService = new sfr.service();

    helloWorldService.create = function() {
        var el = document.createElement('p');
        el.innerHTML = 'Hello World!';
        sfr.doc.appendChild(el);
    };

    return helloWorldService;
});
