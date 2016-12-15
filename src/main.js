! function() {
    // DI loaded first
    __inline('utils/di.js');

    if (DEBUG) {
        __inline('utils/debug.js');
    }

    // router
    __inline('router/router/URL.js');
    __inline('router/router/config.js');
    __inline('router/router/controller.js');
    __inline('router/router.js');

    // utils
    __inline('utils/http.js');
    __inline('utils/url.js');
    __inline('utils/underscore.js');
    __inline('utils/promise.js');
    __inline('utils/assert.js');
    __inline('utils/cache.js');
    __inline('utils/map.js');
    __inline('utils/emitter.js');

    // utils/uri
    __inline('utils/uri/URI.js');
    __inline('utils/uri/component/Abstract.js');
    __inline('utils/uri/component/Fragment.js');
    __inline('utils/uri/component/Host.js');
    __inline('utils/uri/component/Password.js');
    __inline('utils/uri/component/Path.js');
    __inline('utils/uri/component/Port.js');
    __inline('utils/uri/component/Query.js');
    __inline('utils/uri/component/Scheme.js');
    __inline('utils/uri/component/UserName.js');
    __inline('utils/uri/util/parse-query.js');
    __inline('utils/uri/util/stringify-query.js');
    __inline('utils/uri/util/uri-parser.js');

    // core
    __inline('action.js');
    __inline('service.js');
    __inline('resource.js');
    __inline('view.js');
    __inline('doc.js');

    // Register DI modules manually,
    // TODO: this should be removed by not dependent on esl
    var deps = [{
        name: 'action',
        mid: 'sfr/action'
    }, {
        name: 'router',
        mid: 'sfr/router/router'
    }, {
        name: 'view',
        mid: 'sfr/view'
    }, {
        name: 'service',
        mid: 'sfr/service'
    }, {
        name: '_',
        mid: 'sfr/utils/underscore'
    }, {
        name: 'resource',
        mid: 'sfr/resource'
    }, {
        name: 'cache',
        mid: 'sfr/utils/cache'
    }, {
        name: 'http',
        mid: 'sfr/utils/http'
    }, {
        name: 'promise',
        mid: 'sfr/utils/promise'
    }, {
        name: 'emitter',
        mid: 'sfr/utils/emitter'
    }, {
        name: 'url',
        mid: 'sfr/utils/url'
    }];

    var midList = deps.map(function(item) {
        return item.mid;
    });

    di.value('document', window.document);
    di.value('window', window);
    di.value('location', location);

    define('sfr', midList, function() {
        deps.forEach(function(item) {
            di.value(item.name, require(item.mid));
        });

        return di.container;
    });

}();
