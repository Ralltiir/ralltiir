/**
 * @file router测试用例
 * @author treelite(c.xinle@gmail.com)
 */

// window.location.replace 只读。
// 等待 DI+AMD 框架完成之后再迁移这段代码。
var mockLocation = {
    type: 'mock',
    replace: sinon.spy()
};
di.value('location', mockLocation);

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

        beforeEach(function(){
            mockLocation.replace.reset();
        });

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
                router.config({
                    root: '/root'
                });
            });

            afterEach(function () {
                router.stop();
                router.clear();
            });

            it('no handler, throw exception', function () {
                var error;
                try {
                    router.redirect('/foo');
                }
                catch (e) {
                    error = e;
                }
                console.log(mockLocation.replace.args);
                console.log('testing:', mockLocation.type);
                expect(mockLocation.replace).to.have.been.calledWith('/root/foo');
                expect(error.message).to.match(/can not find route/);
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
                expect(state.url).to.equal('/root/home/work?name=treelite&name=saber');
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
                    pathPattern: '/foo',
                    query: {type: 'f'},
                    params: {},
                    url: '/root/foo?type=f',
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
                expect(fn).to.have.been.calledWithMatch({
                    query: {
                        type: 'n'
                    },
                    params: {
                        id: '100'
                    },
                    path: '/product/100',
                    pathPattern: '/product/:id'
                });
            });

            it('RESTful handler (complex)', function () {
                var fn = sinon.spy();

                router.add('/sf_baike/item/:word/:id', fn);
                router.redirect('/sf_baike/item/%E5%88%98%E5%BE%B7%E5%8D%8E/114923?adapt=1&fr=aladdin');

                expect(fn).to.have.been.called;
                var params = fn.args[0];
                var state = params[0];
                expect(fn).to.have.been.calledWithMatch({
                    query: {
                        fr: 'aladdin',
                        adapt: "1"
                    },
                    params: {
                        id: '114923',
                        word: '刘德华'
                    },
                    path: '/sf_baike/item/%E5%88%98%E5%BE%B7%E5%8D%8E/114923',
                    pathPattern: '/sf_baike/item/:word/:id'
                });
            });

            it('RegExp handler', function () {
                var fn = sinon.spy();
                var regex = /\/\d{1,2}$/;

                router.add(regex, fn);

                try {
                    router.redirect('/10');
                    // should error
                    router.redirect('/100');
                }
                catch (e) {}
                expect(fn).to.have.been.calledOnce;
                expect(fn).to.have.been.calledWithMatch({
                    pathPattern: regex,
                    path: '/10'
                });
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
                    pathPattern: '/',
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
