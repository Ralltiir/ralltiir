define(function() {
    var config = {
        // core
        action: {
            type: 'factory',
            module: 'sfr/action',
            args: ['router', 'location']
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
        // Language Enhancements
        assert: {
            type: 'value',
            module: 'sfr/utils/assert'
        },
        _: {
            type: 'value',
            module: 'sfr/utils/underscore'
        },
        promise: {
            type: 'value',
            module: 'sfr/utils/promise'
        },
        emitter: {
            type: 'value',
            module: 'sfr/utils/emitter'
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
    };
    return config;
});
