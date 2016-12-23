/*
 * IoC Dependency Injector
 *   * only support sync AMD modules
 *   * cyclic dependencies are not handled
 *   * entities returned by factories are always cached
 */
define(function() {
    var assert = require('../lang/assert');

    /*
     * Create a IoC container
     * @param {Object} config The dependency tree configuration
     * @param {Function} require Optional, the require used by DI, defaults to `window.require`
     */
    function DI(config, require) {
        this.require = require || window.require;
        this.config = config;
        this.container = Object.create(null);
    }

    DI.prototype.resolve = function(name) {
        if (this.container[name]) {
            return this.container[name];
        }
        var decl = this.config[name];
        assert(decl, 'module declaration not found: ' + name);

        var recipe = decl.value;
        if (!recipe) {
            assert(decl.module, 'empty AMD module id');
            recipe = this.require(decl.module);
        }

        if (decl.type === 'value') {
            return this.container[name] = recipe;
        }

        if (decl.type === 'factory') {
            assert(typeof recipe === 'function', 'entity not injectable: ' + recipe);
            var deps = decl.args || [];
            return this.container[name] = this.inject(recipe, deps);
        }

        throw new Error('recipe type ' + decl.type + ' not recognized');
    }

    DI.prototype.inject = function(factory, deps) {
        // Note: cyclic dependencies are not detected, avoid this!
        var args = deps.map(function(name) {
            return this.resolve(name);
        }, this);

        return factory.apply(null, args);
    };

    return DI;
});
