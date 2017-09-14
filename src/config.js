/**
 * @file config.js DI assembly configuration
 * @author harttle<yangjun14@baidu.com>
 */
define(function (require) {
    var config = {
        // core
        action: {
            type: 'factory',
            module: require('./action'),
            args: [
                'router',
                'location',
                'history',
                'doc',
                'emitter',
                'services'
            ]
        },
        router: {
            type: 'factory',
            module: require('./router/router')
        },
        view: {
            type: 'value',
            module: require('./view')
        },
        service: {
            type: 'value',
            module: require('./service')
        },
        services: {
            type: 'factory',
            args: ['router'],
            module: require('./services')
        },
        resource: {
            type: 'value',
            module: require('./resource')
        },
        doc: {
            type: 'factory',
            module: require('./doc'),
            args: ['document']
        },
        // Utils
        cache: {
            type: 'value',
            module: require('./utils/cache')
        },
        http: {
            type: 'value',
            module: require('./utils/http')
        },
        url: {
            type: 'value',
            module: require('./utils/url')
        },
        di: {
            type: 'value',
            module: require('./utils/di')
        },
        emitter: {
            type: 'value',
            module: require('./utils/emitter')
        },
        // Language Enhancements
        assert: {
            type: 'value',
            module: require('./lang/assert')
        },
        // eslint-disable-next-line
        _: {
            type: 'value',
            module: require('./lang/underscore')
        },
        promise: {
            type: 'value',
            module: require('./lang/promise')
        },
        map: {
            type: 'value',
            module: require('./lang/map')
        },
        // DOM/BOM APIs
        window: {
            type: 'value',
            value: window
        },
        document: {
            type: 'value',
            value: window.document
        },
        location: {
            type: 'value',
            value: window.location
        },
        history: {
            type: 'value',
            value: window.history
        },
        logger: {
            type: 'value',
            module: require('./utils/logger')
        }
    };
    return config;
});
