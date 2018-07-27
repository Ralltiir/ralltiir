/**
 * @file service.js service base class
 * @author harttle<yangjvn@126.com>
 * @module service
 */

define(function (require) {
    var Sandbox = require('@searchfe/sandbox');
    var _ = require('@searchfe/underscore');

    /**
     * 默认实现 Service，其他 Service 可以继承或代理到这个默认实现
     *
     * @constructor
     * @param {string} url 页面 pathname
     * @param {Object} config Service 配置
     * @alias module:service
     */
    var Service = function (url, config) {
        this.url = url;
        this.config = _.defaults(config, this.defaultConfig);

        if (this.config.isRendered) {
            var rootElement = document.querySelector(config.rootSelector);
            this.adopt(rootElement);
        }
        else {
            this.rootElement = this.createRoot();
            this.sandbox = new Sandbox(this.rootElement);
            this.pendingFetch = this.fetch();
        }
    };

    Service.prototype.renderTo = function (container) {
        if (!this.pendingFetch) {
            this.pendingFetch = this.fetch();
        }
        return this.pendingFetch.then(function (html) {
            this.rootElement.innerHTML = html;
            container.appendChild(this.rootElement);
            this.sandbox.run();
        });
    };

    Service.prototype.stop = function () {
        this.sandbox.stop();
    };

    Service.prototype.destroy = function () {
        this.sandbox.die();
    };

    Service.prototype.fetch = function () {
        var url = this.getBackendUrl();
        this.pendingFetch = this.sandbox.window.fetch(url).then(function (res) {
            return res.text();
        });
    };

    Service.prototype.getBackendUrl = function () {
        var conf = this.config;
        var url;
        if (_.isString(conf.backendUrl)) {
            url = this.url.replace(conf.pathPattern, conf.backendUrl);
        }
        if (_.isString(conf.origin)) {
            url = conf.origin + url;
        }
        return url;
    };

    Service.prototype.createRoot = function () {
        var root = document.createElement('div');
        root.setAttribute('class', 'rt-view');
        return root;
    };

    Service.prototype.adopt = function (rootElement) {
        this.sandbox = rootElement.sandbox;
        if (!this.sandbox) {
            this.sandbox = new Sandbox(rootElement);
        }
        this.sandbox.run();
    };

    Service.prototype.defaultConfig = {
        backendUrl: null,
        rootSelector: '.rt-view'
    };

    return Service;
});
