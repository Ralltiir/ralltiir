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
                'services',
                'dispatch'
            ]
        },
        dispatch: {
            type: 'factory',
            module: require('./dispatch')
        },
        transitions: {
            type: 'value',
            module: require('./transitions')
        },
        router: {
            type: 'factory',
            module: require('./router/router')
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
            module: require('@searchfe/assert')
        },
        // eslint-disable-next-line
        _: {
            type: 'value',
            module: require('@searchfe/underscore')
        },
        promise: {
            type: 'value',
            module: require('@searchfe/promise')
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
