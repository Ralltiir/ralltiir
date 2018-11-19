/**
* @file test/services.js test suite for services.js
* @author oott123
*/

/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
/* globals sinon: true */

define(function (require) {
    var Promise = require('@searchfe/promise');
    var routerFactory = require('router/router');
    var servicesFactory = require('services');

    describe('services', function () {
        var router;
        var services;
        var dispatcher;
        var fooService;
        var barService;
        var singletonService;

        beforeEach(function () {
            router = routerFactory();
            services = servicesFactory(router);
            dispatcher = sinon.spy();
            services.init(dispatcher);
            fooService = sinon.spy();
            fooService.prototype = {
                constructor: fooService,
                name: 'fooService',
                create: sinon.spy(),
                attach: sinon.spy(),
                detach: sinon.spy(),
                abort: sinon.spy(),
                destroy: sinon.spy(),
                partialUpdate: sinon.spy(),
                update: sinon.spy()
            };
            barService = sinon.spy();
            barService.prototype = {
                constructor: barService,
                name: 'barService',
                create: sinon.spy(),
                attach: sinon.spy(),
                detach: sinon.spy(),
                destroy: sinon.spy(),
                update: sinon.spy()
            };
            singletonService = {
                name: 'singletonService',
                create: sinon.spy(),
                attach: sinon.spy(),
                detach: sinon.spy(),
                destroy: sinon.spy(),
                update: sinon.spy(),
                singleton: true
            };
        });

        afterEach(function () {
            services.unRegisterAll();
            services.destroy();
        });

        it('should register singleton', function () {
            services.register('/foo', null, singletonService);
            var singleton = services.getOrCreate('/foo?id=1');
            expect(singleton).equals(singletonService);
        });

        it('should register and create and get service instances', function () {
            services.register('/foo', null, fooService);
            services.register(/^\/bar/, null, barService);

            var fooInstance = services.getOrCreate('/foo?id=1');
            expect(fooService).has.been.calledOnce;
            expect(Object.getPrototypeOf(fooInstance)).equals(fooService.prototype);

            var fooInstance2 = services.getOrCreate('/foo?id=1');
            expect(fooService).has.been.calledOnce;
            expect(fooInstance).equals(fooInstance2);

            var fooInstance3 = services.getOrCreate('/foo?id=2', '/foo');
            expect(Object.getPrototypeOf(fooInstance3)).equals(fooService.prototype);

            var undefinedInstance = services.getOrCreate('/404');
            expect(undefinedInstance).to.be.undefined;

            var barInstance = services.getOrCreate('/bar/hello');
            expect(Object.getPrototypeOf(barInstance)).equals(barService.prototype);
        });

        it('isRegistered should works fine', function () {
            services.register('/foo', null, fooService);
            services.register(/^\/bar/, null, barService);

            expect(services.isRegistered('/foo')).to.be.true;
            expect(services.isRegistered('/foo1')).to.be.false;
            expect(services.isRegistered(/\/foo/)).to.be.false;
            expect(services.isRegistered(/^\/bar/)).to.be.true;
            expect(services.isRegistered('^/bar')).to.be.false;
            expect(services.isRegistered('^\\/bar')).to.be.false;
        });

        it('should call destroy when remove cached service instances', function () {
            services.register('/foo', null, fooService);
            for (var i = 0; i < 9; i++) {
                services.getOrCreate('/foo?id=' + i);
            }

            expect(fooService.prototype.destroy).has.been.calledOnce;
        });

        it('shouldnt call destroy when remove cached singleton service', function () {
            services.register('/foo', null, singletonService);
            for (var i = 0; i < 9; i++) {
                services.getOrCreate('/foo?id=' + i);
            }

            expect(fooService.prototype.destroy).has.not.been.called;
        });

        it('should works when set instance limit', function () {
            services.setInstanceLimit(1);

            services.register('/foo', null, fooService);
            for (var i = 0; i < 2; i++) {
                services.getOrCreate('/foo?id=' + i);
            }

            expect(fooService.prototype.destroy).has.been.calledOnce;
        });

        it('should async boardcast messages to all instances', function () {
            var MESSAGE_CONTENT = 'Hello, foo!';
            services.register('/foo', null, fooService);
            services.register('/bar', null, barService);

            var instance = services.getOrCreate('/foo?id=1');
            instance.onMessage = sinon.spy();
            var instance2 = services.getOrCreate('/foo?id=2');
            instance2.onMessage = sinon.spy();
            services.getOrCreate('/bar'); // for instances without `onMessage`

            services.postMessage(MESSAGE_CONTENT, '*');

            // will not recieve message until next macro task
            expect(instance.onMessage).not.to.be.called;
            expect(instance2.onMessage).not.to.be.called;

            return new Promise(function (resolve) {
                // ensure marco task
                setTimeout(resolve);
            })
            .then(function () {
                expect(instance.onMessage).to.be.calledWith(MESSAGE_CONTENT);
                expect(instance2.onMessage).to.be.calledWith(MESSAGE_CONTENT);
            });
        });

        it('should async boardcast messages to given instances', function () {
            var MESSAGE_CONTENT = 'Hello, foo!';
            services.register('/foo', null, fooService);
            services.register('/bar', null, barService);

            var fooInstance = services.getOrCreate('/foo');
            fooInstance.onMessage = sinon.spy();
            var barInstance = services.getOrCreate('/bar');
            barInstance.onMessage = sinon.spy();

            services.postMessage(MESSAGE_CONTENT, fooInstance.name);

            // will not recieve message until next macro task
            expect(fooInstance.onMessage).not.to.be.called;
            expect(barInstance.onMessage).not.to.be.called;

            return new Promise(function (resolve) {
                // ensure marco task
                setTimeout(resolve);
            })
            .then(function () {
                expect(fooInstance.onMessage).to.be.calledWith(MESSAGE_CONTENT);
                expect(barInstance.onMessage).not.to.be.called;
            });
        });

        it('should successfully copyServiceMapping', function () {
            services.register('/foo', null, fooService);
            var instance = services.getOrCreate('/foo?id=1');
            expect(services.copyServiceMapping('/foo?id=1', '/foo?id=2')).to.be.true;

            var instance2 = services.getOrCreate('/foo?id=2');
            expect(instance).equals(instance2);
        });

        it('should return false when copying not exists service', function () {
            services.register('/foo', null, fooService);
            var instance = services.getOrCreate('/foo?id=1');
            expect(services.copyServiceMapping('/foo?id=2', '/foo?id=3')).to.be.false;

            var instance2 = services.getOrCreate('/foo?id=2');
            expect(instance).not.equals(instance2);
        });

        it('should successfully setInstance', function () {
            services.register('/foo', null, fooService);
            services.register('/bar', null, barService);
            var urla = '/foo?id=2';
            var urlb = '/foo?id=3';

            var urlc = '/foo?id=4';
            var urld = '/foo?id=5';
            var instancea = services.getOrCreate(urla);
            services.setInstance(urlb, instancea);
            expect(services.getOrCreate(urlb)).equals(instancea);

            var Service = services.urlEntries.get(router.pathPattern(urlc)).service;
            var instanceb = new Service(urlc, {});
            services.setInstance(urld, instanceb);
            expect(services.getOrCreate(urld)).equals(instanceb);
        });
    });
});
