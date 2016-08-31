/**
 * @file router测试用例
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var router = require('router/router');
    var URL = require('router/router/URL');

    // mock controller
    var controller = {
        init: function (applyHander) {
            this.applyHander = applyHander;
        },
        redirect: function (url, query, options) {
            url = new URL(url, {query: query});
            if (!this.url || !this.url.equal(url)) {
                this.applyHander(url, options);
                this.url = url;
            }
        },
        dispose: function () {
            this.applyHander = null;
            this.url = null;
        },
        reset: function () {}
    };

    router.controller(controller);

    describe('main', function () {

        describe('start/stop', function () {

            it('should init controller and dipose controller', function () {
                spyOn(controller, 'init');
                spyOn(controller, 'dispose');

                router.start();
                router.stop();

                expect(controller.init.calls.count()).toBe(1);
                expect(controller.dispose.calls.count()).toBe(1);
            });

        });

        describe('add/remove', function () {

            beforeEach(function () {
                router.start();
            });

            afterEach(function () {
                router.stop();
                router.clear();
            });

            it('no handler, throw exception', function () {
                var error;
                try {
                    router.redirect('/');
                }
                catch (e) {
                    error = e;
                }
                expect(error).not.toBeUndefined();
                expect(error.message.indexOf('route') >= 0).toBeTruthy();
            });

            it('default handler', function () {
                var error;
                var fn = jasmine.createSpy('fn');

                router.add('', fn);
                try {
                    router.redirect('/');
                }
                catch (e) {
                    error = e;
                }

                expect(error).toBeUndefined();
                expect(fn).toHaveBeenCalled();
            });

            it('call handler with params', function () {
                var fn = jasmine.createSpy('fn');
                var options = {foo: 'bar'};

                router.add('/home/work', fn);

                router.redirect('/home/work?name=treelite', {name: 'saber'}, options);

                expect(fn).toHaveBeenCalled();
                var params = fn.calls.argsFor(0);
                var state = params[0];
                expect(state.path).toEqual('/home/work');
                expect(state.query).toEqual({name: ['treelite', 'saber']});
                expect(state.params).toEqual({});
                expect(state.options).toEqual(options);
                expect(state.url).toEqual('/home/work?name=treelite&name=saber');
            });

            it('handler\'s prevState', function () {
                var fn1 = jasmine.createSpy('fn1');
                var fn2 = jasmine.createSpy('fn2');

                router.add('/foo', fn1);
                router.add('/bar', fn2);

                router.redirect('/foo?type=f');

                expect(fn1).toHaveBeenCalled();
                var params1 = fn1.calls.argsFor(0);
                expect(params1[1]).toEqual({});

                router.redirect('/bar');

                expect(fn2).toHaveBeenCalled();
                var params2 = fn2.calls.argsFor(0);
                expect(params2[1]).toEqual(params1[0]);
                expect(params2[1]).toEqual({
                    path: '/foo',
                    query: {type: 'f'},
                    params: {},
                    url: '/foo?type=f',
                    options: {}
                });
            });

            it('RESTful handler', function () {
                var fn = jasmine.createSpy('fn');

                router.add('/product/:id', fn);
                router.redirect('/product/100?type=n');

                expect(fn).toHaveBeenCalled();
                var params = fn.calls.argsFor(0);
                var state = params[0];
                expect(state.query).toEqual({type: 'n'});
                expect(state.params).toEqual({id: '100'});
            });

            it('RegExp handler', function () {
                var fn = jasmine.createSpy('fn');

                router.add(/\/\d{1,2}$/, fn);

                try {
                    router.redirect('/10');
                    // should error
                    router.redirect('/100');
                }
                catch (e) {}
                expect(fn.calls.count()).toBe(1);
            });

            it('add the same handler repeatedly should throw error', function () {
                var error;
                var fn = jasmine.createSpy('fn');

                router.add('/', fn);
                try {
                    router.add('/', fn);
                }
                catch (e) {
                    error = true;
                }
                expect(error).toBeTruthy();

                error = false;
                router.add('/list/:id', fn);
                try {
                    router.add('/list/:id', fn);
                }
                catch (e) {
                    error = true;
                }
                expect(error).toBeTruthy();

                error = false;
                router.add(/\/abc$/, fn);
                try {
                    router.add(/\/abc$/, fn);
                }
                catch (e) {
                    error = true;
                }
                expect(error).toBeTruthy();
            });

            it('remove rule', function () {
                var fn1 = jasmine.createSpy('fn1');
                var fn2 = jasmine.createSpy('fn2');
                var fn3 = jasmine.createSpy('fn3');

                router.add('/', fn1);
                router.add('/list/:id', fn2);
                router.add(/\/abc$/, fn3);

                router.redirect('/');
                expect(fn1.calls.count()).toBe(1);
                router.redirect('/list/100');
                expect(fn2.calls.count()).toBe(1);
                router.redirect('/abc');
                expect(fn3.calls.count()).toBe(1);

                function tryRedirect(path) {
                    try {
                        router.redirect('/');
                    }
                    catch (e) {
                        return false;
                    }
                    return true;
                }

                router.remove('/');
                expect(tryRedirect('/')).toBeFalsy();
                expect(fn1.calls.count()).toBe(1);

                router.remove('/list/:id');
                expect(tryRedirect('/list/100')).toBeFalsy();
                expect(fn2.calls.count()).toBe(1);

                router.remove(/\/abc$/);
                expect(tryRedirect('/abc')).toBeFalsy();
                expect(fn3.calls.count()).toBe(1);
            });

        });

        describe('config', function () {

            beforeEach(function () {
                router.start();
            });

            afterEach(function () {
                router.stop();
                router.clear();
                // reset config
                router.config({
                    path: '/',
                    root: ''
                });
            });

            it('default path is "/"', function () {
                var fn = jasmine.createSpy('fn');
                router.add('/', fn);

                router.redirect();
                expect(fn).toHaveBeenCalled();
            });

            it('set path', function () {
                var fn = jasmine.createSpy('fn');
                router.config({
                    path: '/abc/'
                });
                router.add('/abc/', fn);

                router.redirect();
                expect(fn).toHaveBeenCalled();
            });

            it('set root', function () {
                var fn = jasmine.createSpy('fn');
                router.config({
                    // 正确的root是'/hello'
                    // 此处验证容错性
                    root: 'hello/'
                });
                router.add('/', fn);

                router.redirect('/');
                expect(fn).toHaveBeenCalled();
                var args = fn.calls.argsFor(0);
                var state = args[0];
                expect(state).toEqual({
                    path: '/',
                    query: {},
                    params: {},
                    url: '/hello/',
                    options: {}
                });
            });

        });

        describe('support async handler', function () {

            beforeEach(function () {
                router.start();
            });

            afterEach(function () {
                router.stop();
                router.clear();
            });

            it('will call waiting route', function (done) {
                var fn1 = function (state, prevState, done) {
                    setTimeout(done, 300);
                };

                var fn2 = jasmine.createSpy('fn2');

                router.add('/', fn1);
                router.add('/new', fn2);

                router.redirect('/');
                router.redirect('/new');

                expect(fn2).not.toHaveBeenCalled();

                setTimeout(function () {
                    expect(fn2).toHaveBeenCalled();
                    done();
                }, 400);
            });

            it ('only wait for the last route', function (done) {
                var fn1 = function (state, prevState, done) {
                    setTimeout(done, 300);
                };

                var fn2 = jasmine.createSpy('fn2');
                var fn3 = jasmine.createSpy('fn3');

                router.add('/', fn1);
                router.add('/new', fn2);
                router.add('/detail', fn3);

                router.redirect('/');
                router.redirect('/new');
                router.redirect('/detail');

                expect(fn2).not.toHaveBeenCalled();
                expect(fn3).not.toHaveBeenCalled();

                setTimeout(function () {
                    expect(fn2).not.toHaveBeenCalled();
                    expect(fn3).toHaveBeenCalled();
                    done();
                }, 400);
            });

        });

    });

});
