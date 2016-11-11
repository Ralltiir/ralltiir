! function() {
    // DI loaded first
    __inline('utils/di.js');

    // router
    __inline('router/lang/extend.js');
    __inline('router/lang/inherits.js');
    __inline('router/emitter.js');
    __inline('router/router/URL.js');
    __inline('router/router/config.js');
    __inline('router/router/controller.js');
    __inline('router/router.js');
    __inline('router/uri.js');
    __inline('router/uri/URI.js');
    __inline('router/uri/component/Abstract.js');
    __inline('router/uri/component/Fragment.js');
    __inline('router/uri/component/Host.js');
    __inline('router/uri/component/Password.js');
    __inline('router/uri/component/Path.js');
    __inline('router/uri/component/Port.js');
    __inline('router/uri/component/Query.js');
    __inline('router/uri/component/Scheme.js');
    __inline('router/uri/component/UserName.js');
    __inline('router/uri/util/parse-query.js');
    __inline('router/uri/util/stringify-query.js');
    __inline('router/uri/util/uri-parser.js');

    // utils
    __inline('utils/http.js');
    __inline('utils/url.js');
    __inline('utils/underscore.js');
    __inline('utils/promise.js');
    __inline('utils/assert.js');
    __inline('utils/map.js');

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
        name: 'resource',
        mid: 'sfr/resource'
    }, {
        name: 'http',
        mid: 'sfr/utils/http'
    }, {
        name: 'promise',
        mid: 'sfr/utils/promise'
    }];

    var midList = deps.map(function(item) {
        return item.mid;
    });

    define('sfr', midList, function() {
        deps.forEach(function(item) {
            di.value(item.name, require(item.mid));
        });

        return di.container;
    });

}();
