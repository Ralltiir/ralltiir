define(function() {
    var config = {
        // core
        action: {
            type: 'factory',
            module: 'sfr/action',
            args: ['router', 'location', 'history']
        },
        router: {
            type: 'value',
            module: 'sfr/router/router'
        },
        view: {
            type: 'value',
            module: 'sfr/view'
        },
        service: {
            type: 'value',
            module: 'sfr/service'
        },
        resource: {
            type: 'value',
            module: 'sfr/resource'
        },
        doc: {
            type: 'factory',
            module: 'sfr/doc',
            args: ['document']
        },
        // Utils
        cache: {
            type: 'value',
            module: 'sfr/utils/cache'
        },
        http: {
            type: 'value',
            module: 'sfr/utils/http'
        },
        url: {
            type: 'value',
            module: 'sfr/utils/url'
        },
        di: {
            type: 'value',
            module: 'sfr/utils/di'
        },
        emitter: {
            type: 'value',
            module: 'sfr/utils/emitter'
        },
        // Language Enhancements
        assert: {
            type: 'value',
            module: 'sfr/lang/assert'
        },
        _: {
            type: 'value',
            module: 'sfr/lang/underscore'
        },
        promise: {
            type: 'value',
            module: 'sfr/lang/promise'
        },
        map: {
            type: 'value',
            module: 'sfr/lang/map'
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
        }
    };
    return config;
});
