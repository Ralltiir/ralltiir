/**
 * @file controller test spec
 * @author treelite(c.xinle@gmail.com), Firede(firede@firede.us)
 */

/* eslint-env mocha */

/* eslint-disable max-nested-callbacks */

/* globals sinon: true */

define(function (require) {

    var INTERVAL_TIME = 100;
    var controller = require('router/router/controller');

    describe('router/router/controller', function () {
        var pathname;

        beforeEach(function () {
            pathname = location.pathname;
        });

        describe('init/dipose', function () {

            it('should apply handler with current path', function (done) {
                var fn = sinon.spy();
                history.pushState({}, document.title, '?name=treelite&w=1');

                controller.init(fn);
                controller.dispose();

                expect(fn).to.have.been.called;

                var args = fn.args[0];
                expect(args.length).to.equal(2);

                var url = args[0];
                expect(url.toString()).to.deep.equal(pathname + '?name=treelite&w=1');
                expect(url.path.get()).to.deep.equal(pathname);
                expect(url.query.get()).to.deep.equal({name: 'treelite', w: '1'});

                history.back();
                setTimeout(function () {
                    done();
                }, INTERVAL_TIME);
            });

            it('should monitor hashchange', function (done) {
                var fn = sinon.spy();

                history.pushState({}, document.title, '/abc');

                controller.init(fn);

                history.back();
                setTimeout(function () {
                    expect(fn).to.have.been.calledTwice;
                    expect(fn).to.have.been.calledWithMatch({}, {
                        src: 'sync'
                    });
                    expect(fn).to.have.been.calledWithMatch({}, {
                        src: 'history'
                    });
                    controller.dispose();
                    done();
                }, INTERVAL_TIME);
            });
        });

        describe('redirect', function () {

            var handler = sinon.spy();

            function finish(done, count) {
                count = count || 1;
                history.go(-1 * count);
                setTimeout(done, INTERVAL_TIME);
            }

            beforeEach(function () {
                controller.init(handler);
                handler.reset();
            });

            afterEach(function () {
                controller.dispose();
            });

            it('should call the handler and change the location', function (done) {
                var path = '/abc';
                controller.redirect(path);
                setTimeout(function () {
                    expect(handler).to.have.been.calledOnce;
                    expect(location.pathname).to.deep.equal(path);
                    finish(done);
                }, INTERVAL_TIME);
            });

            it('with query should call the handler and change the hash', function (done) {
                var path = '/abc';
                controller.redirect(path, {
                    name: 'treelite'
                });
                setTimeout(function () {
                    expect(handler).to.have.been.calledOnce;
                    expect(location.pathname).to.deep.equal(path);
                    expect(location.search).to.deep.equal('?name=treelite');
                    finish(done);
                }, INTERVAL_TIME);
            });

            it('to the same path do not fire the handler repeatedly', function (done) {
                var path = '/abc';
                controller.redirect(path);
                setTimeout(function () {
                    controller.redirect(path);
                    setTimeout(function () {
                        expect(handler).to.have.been.calledOnce;
                        finish(done);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('to different segment do not fire the handler repeatedly', function (done) {
                var path = '/abc';
                controller.redirect(path);
                setTimeout(function () {
                    controller.redirect(path + '#hello');
                    setTimeout(function () {
                        expect(handler).to.have.been.calledOnce;
                        history.back();
                        setTimeout(function () {
                            expect(handler).to.have.been.calledOnce;
                            finish(done);
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('to the same path with different query should fire the handler repeatedly', function (done) {
                var path = '/abc';
                controller.redirect(path);
                setTimeout(function () {
                    controller.redirect(path, {
                        name: 'treelite'
                    });
                    setTimeout(function () {
                        controller.redirect(path + '?name=saber');
                        setTimeout(function () {
                            expect(handler).to.have.been.calledThrice;
                            finish(done, 3);
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('to the same path width `force` params should fire the handler repeatedly', function (done) {
                var path = '/abc';
                controller.redirect(path);
                setTimeout(function () {
                    controller.redirect(path, null, {
                        force: true
                    });
                    setTimeout(function () {
                        expect(handler).to.have.been.calledTwice;
                        finish(done);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);

            });

            it('do not change the hash while call it with `silent` param', function (done) {
                controller.redirect('/abc', null, {
                    silent: true
                });
                setTimeout(function () {
                    expect(handler).to.have.been.calledOnce;
                    expect(location.pathname).to.deep.equal(pathname);
                    done();
                }, INTERVAL_TIME);
            });

            it('fire the handler with URL param', function (done) {
                controller.redirect('/abc?name=treelite');
                setTimeout(function () {
                    var url = handler.args[0][0];
                    expect(url.getPath()).to.deep.equal('/abc');
                    expect(url.getQuery()).to.deep.equal({
                        name: 'treelite'
                    });

                    controller.redirect('/bbb', {
                        query: 'abc'
                    });
                    setTimeout(function () {
                        var url = handler.args[1][0];
                        expect(url.getPath()).to.deep.equal('/bbb');
                        expect(url.getQuery()).to.deep.equal({
                            query: 'abc'
                        });
                        finish(done, 2);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('fire the handler with options', function (done) {
                controller.redirect('/abc', {
                    name: 'treelite'
                }, {
                    foo: 'bar'
                });
                setTimeout(function () {
                    var url = handler.args[0][0];
                    var options = handler.args[0][1];
                    expect(url.toString()).to.deep.equal('/abc?name=treelite');
                    expect(options).to.deep.equal({
                        foo: 'bar'
                    });
                    finish(done);
                }, INTERVAL_TIME);
            });

            it('support relative path', function (done) {
                controller.redirect('/a/b/c');
                setTimeout(function () {
                    controller.redirect('d');
                    setTimeout(function () {
                        expect(handler).to.have.been.calledTwice;
                        expect(location.pathname).to.deep.equal('/a/b/d');
                        var url = handler.args[1][0];
                        expect(url.toString()).to.deep.equal('/a/b/d');
                        controller.redirect('../b/d');
                        setTimeout(function () {
                            setTimeout(function () {
                                expect(handler).to.have.been.calledTwice;
                                expect(location.pathname).to.deep.equal('/a/b/d');
                                finish(done, 2);
                            }, INTERVAL_TIME);
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('support empty path', function (done) {
                var url = '/a/b/c';
                var query = '?name=treelite';
                controller.redirect(url);
                setTimeout(function () {
                    controller.redirect(query);
                    setTimeout(function () {
                        expect(handler).to.have.been.calledTwice;
                        expect(location.pathname).to.deep.equal(url);
                        expect(location.search).to.deep.equal(query);
                        controller.redirect('', {
                            name: 'saber'
                        });
                        setTimeout(function () {
                            expect(handler).to.have.been.calledThrice;
                            expect(location.pathname).to.deep.equal(url);
                            expect(location.search).to.deep.equal('?name=saber');
                            finish(done, 3);
                        });
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

        });

        describe('reset', function () {

            var handler = sinon.spy();

            function finish(done, count) {
                count = count || 1;
                history.go(-1 * count);
                setTimeout(done, INTERVAL_TIME);
            }

            beforeEach(function () {
                controller.init(handler);
                handler.reset();
            });

            afterEach(function () {
                controller.dispose();
            });

            it('should call the handler and not increase history', function (done) {
                controller.redirect('/somewehre');
                setTimeout(function () {
                    controller.reset('/reset');
                    setTimeout(function () {
                        expect(location.pathname).to.deep.equal('/reset');
                        expect(handler).to.have.been.calledTwice;
                        controller.redirect('/reset');
                        setTimeout(function () {
                            expect(handler).to.have.been.calledTwice;
                            history.back();
                            setTimeout(function () {
                                expect(location.pathname).to.deep.equal(pathname);
                                expect(handler).to.have.been.calledThrice;
                                done();
                            }, INTERVAL_TIME);
                        });
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('with silent param should not call the handler', function (done) {
                controller.redirect('/somewhere');
                setTimeout(function () {
                    controller.reset('/reset', null, {
                        silent: true
                    });
                    setTimeout(function () {
                        expect(location.pathname).to.deep.equal('/reset');
                        expect(handler).to.have.been.calledOnce;
                        finish(done);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('the same path do not fire handler repeatedly', function (done) {
                controller.redirect('/somewhere');
                setTimeout(function () {
                    controller.reset('/reset');
                    setTimeout(function () {
                        expect(handler).to.have.been.calledTwice;
                        controller.reset(('/reset'));
                        setTimeout(function () {
                            expect(handler).to.have.been.calledTwice;
                            history.back();
                            setTimeout(function () {
                                expect(handler).to.have.been.calledThrice;
                                expect(location.pathname).to.deep.equal(pathname);
                                done();
                            }, INTERVAL_TIME);
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });
        });

    });

});
