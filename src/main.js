/**
 * @file main.js inline all modules
 * @author harttle<yangjun14@baidu.com>
 */
(function () {
    // router
    __inline('router/router/URL.js');
    __inline('router/router/config.js');
    __inline('router/router/controller.js');
    __inline('router/router.js');

    // utils
    __inline('utils/di.js');
    __inline('utils/logger.js');
    __inline('utils/http.js');
    __inline('utils/url.js');
    __inline('utils/cache.js');
    __inline('utils/emitter.js');

    // lang
    __inline('lang/underscore.js');
    __inline('lang/promise.js');
    __inline('lang/assert.js');
    __inline('lang/map.js');

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
    __inline('config.js');

    require(['sfr/utils/di', 'sfr/config'], function (DI, config) {
        var amdModuleList = Object.keys(config)
            .filter(function (key) {
                return config[key].module;
            })
            .map(function (key) {
                return config[key].module;
            });

        define('sfr', amdModuleList, function () {
            var di = new DI(config);

            Object.keys(config).forEach(di.resolve, di);
            return di.container;
        });
    });
})();
