/**
 * @file IoC Dependency Injector
 *   * only support sync AMD modules
 *   * cyclic dependencies are not handled
 *   * entities returned by factories are always cached
 * @author harttle<yangjun14@baidu.com>
 */
define(function (require) {
    var assert = require('../lang/assert');
    var _ = require('../lang/underscore');

    /**
     * Create a IoC container
     *
     * @constructor
     * @param {Object} config The dependency tree configuration
     * @param {Function} require Optional, the require used by DI, defaults to `window.require`
     */
    function DI(config, require) {
        // this.require = require || window.require;
        this.config = this.normalize(config);
        this.container = Object.create(null);
    }

    DI.prototype.resolve = function (name) {
        var decl = this.config[name];
        assert(decl, 'module declaration not found: ' + name);

        // cache check
        if (this.container[name] && decl.cache) {
            return this.container[name];
        }

        // AMD resolving
        if (decl.value === undefined && decl.module) {
            decl.value = decl.module;
        }

        switch (decl.type) {
            case 'value':
                return this.container[name] = decl.value;
            case 'factory':
                assert(typeof decl.value === 'function', 'entity not injectable: ' + decl.value);
                var deps = decl.args || [];
                return this.container[name] = this.inject(decl.value, deps);
            default:
                throw new Error('DI type ' + decl.type + ' not recognized');
        }
    };

    DI.prototype.inject = function (factory, deps) {
        // Note: cyclic dependencies are not detected, avoid this!
        var args = deps.map(function (name) {
            return this.resolve(name);
        }, this);

        return factory.apply(null, args);
    };

    DI.prototype.normalize = function (config) {
        _.forOwn(config, function (decl, key) {
            if (decl.cache === undefined) {
                decl.cache = true;
            }

            if (decl.type === undefined) {
                decl.type = 'value';
            }

        });
        return config;
    };

    return DI;
});
