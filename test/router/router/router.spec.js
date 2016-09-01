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

    describe('router/router', function () {

        describe('start/stop', function () {

            it('should init controller and dipose controller', function () {
                sinon.spy(controller, 'init');
                sinon.spy(controller, 'dispose');

                router.start();
                router.stop();

                expect(controller.init).have.been.calledOnce;
                expect(controller.dispose).have.been.calledOnce;
                controller.init.restore();
                controller.dispose.restore();
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
                expect(error).not.to.be.undefined;
                expect(error.message.indexOf('route') >= 0).to.be.ok;
            });

            it('default handler', function () {
                var error;
                var fn = sinon.spy();

                router.add('', fn);
                try {
                    router.redirect('/');
                }
                catch (e) {
                    error = e;
                }

                expect(error).to.be.undefined;
                expect(fn).to.have.been.called;
            });

            it('call handler with params', function () {
                var fn = sinon.spy();
                var options = {foo: 'bar'};

                router.add('/home/work', fn);

                router.redirect('/home/work?name=treelite', {name: 'saber'}, options);

                expect(fn).to.have.been.called;
                var params = fn.args[0];
                var state = params[0];
                expect(state.path).to.equal('/home/work');
                expect(state.query).to.deep.equal({name: ['treelite', 'saber']});
                expect(state.params).to.deep.equal({});
                expect(state.options).to.deep.equal(options);
                expect(state.url).to.equal('/home/work?name=treelite&name=saber');
            });

            it('handler\'s prevState', function () {
                var fn1 = sinon.spy();
                var fn2 = sinon.spy();

                router.add('/foo', fn1);
                router.add('/bar', fn2);

                router.redirect('/foo?type=f');

                expect(fn1).to.have.been.called;
                var params1 = fn1.args[0];
                expect(params1[1]).to.deep.equal({});

                router.redirect('/bar');

                expect(fn2).to.have.been.called;
                var params2 = fn2.args[0];
                expect(params2[1]).to.deep.equal(params1[0]);
                expect(params2[1]).to.deep.equal({
                    path: '/foo',
                    query: {type: 'f'},
                    params: {},
                    url: '/foo?type=f',
                    options: {}
                });
            });

            it('RESTful handler', function () {
                var fn = sinon.spy();

                router.add('/product/:id', fn);
                router.redirect('/product/100?type=n');

                expect(fn).to.have.been.called;
                var params = fn.args[0];
                var state = params[0];
                expect(state.query).to.deep.equal({type: 'n'});
                expect(state.params).to.deep.equal({id: '100'});
            });

            it('RegExp handler', function () {
                var fn = sinon.spy();

                router.add(/\/\d{1,2}$/, fn);

                try {
                    router.redirect('/10');
                    // should error
                    router.redirect('/100');
                }
                catch (e) {}
                expect(fn).to.have.been.calledOnce;
            });

            it('add the same handler repeatedly should throw error', function () {
                var error;
                var fn = sinon.spy();

                router.add('/', fn);
                try {
                    router.add('/', fn);
                }
                catch (e) {
                    error = true;
                }
                expect(error).to.be.ok;

                error = false;
                router.add('/list/:id', fn);
                try {
                    router.add('/list/:id', fn);
                }
                catch (e) {
                    error = true;
                }
                expect(error).to.be.ok;

                error = false;
                router.add(/\/abc$/, fn);
                try {
                    router.add(/\/abc$/, fn);
                }
                catch (e) {
                    error = true;
                }
                expect(error).to.be.ok;
            });

            it('remove rule', function () {
                var fn1 = sinon.spy();
                var fn2 = sinon.spy();
                var fn3 = sinon.spy();

                router.add('/', fn1);
                router.add('/list/:id', fn2);
                router.add(/\/abc$/, fn3);

                router.redirect('/');
                expect(fn1).to.have.been.calledOnce;
                router.redirect('/list/100');
                expect(fn2).to.have.been.calledOnce;
                router.redirect('/abc');
                expect(fn3).to.have.been.calledOnce;

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
                expect(tryRedirect('/')).to.not.be.ok;
                expect(fn1).to.have.been.calledOnce;

                router.remove('/list/:id');
                expect(tryRedirect('/list/100')).to.not.be.ok;
                expect(fn2).to.have.been.calledOnce;

                router.remove(/\/abc$/);
                expect(tryRedirect('/abc')).to.not.be.ok;
                expect(fn3).to.have.been.calledOnce;
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
                var fn = sinon.spy();
                router.add('/', fn);

                router.redirect();
                expect(fn).to.have.been.called;
            });

            it('set path', function () {
                var fn = sinon.spy();
                router.config({
                    path: '/abc/'
                });
                router.add('/abc/', fn);

                router.redirect();
                expect(fn).to.have.been.called;
            });

            it('set root', function () {
                var fn = sinon.spy();
                router.config({
                    // 正确的root是'/hello'
                    // 此处验证容错性
                    root: 'hello/'
                });
                router.add('/', fn);

                router.redirect('/');
                expect(fn).to.have.been.called;
                var args = fn.args[0];
                var state = args[0];
                expect(state).to.deep.equal({
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

                var fn2 = sinon.spy();

                router.add('/', fn1);
                router.add('/new', fn2);

                router.redirect('/');
                router.redirect('/new');

                expect(fn2).to.not.have.been.called;

                setTimeout(function () {
                    expect(fn2).to.have.been.called;
                    done();
                }, 400);
            });

            it ('only wait for the last route', function (done) {
                var fn1 = function (state, prevState, done) {
                    setTimeout(done, 300);
                };

                var fn2 = sinon.spy();
                var fn3 = sinon.spy();

                router.add('/', fn1);
                router.add('/new', fn2);
                router.add('/detail', fn3);

                router.redirect('/');
                router.redirect('/new');
                router.redirect('/detail');

                expect(fn2).to.not.have.been.called;
                expect(fn3).to.not.have.been.called;

                setTimeout(function () {
                    expect(fn2).to.not.have.been.called;
                    expect(fn3).to.have.been.called;
                    done();
                }, 400);
            });

        });

    });

});
