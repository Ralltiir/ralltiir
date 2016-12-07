/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/action.js
 */

define(['../src/action', '../router/router', '../src/utils/promise.js'], function(action, router, Promise) {
    describe('action/action', function() {
        /*
         * Stub 外部对象
         */
        var fooService, barService, current, prev;
        beforeEach(function() {
            action.clear();
            sinon.stub(router, 'reset');
            sinon.stub(router, 'redirect');
            sinon.stub(router, 'stop');
            sinon.stub(history, 'back');
            fooService = {
                create: sinon.spy(),
                attach: sinon.spy(),
                detach: sinon.spy(),
                destroy: sinon.spy(),
                update: sinon.spy()
            };
            barService = {
                create: sinon.spy(),
                attach: sinon.spy(),
                detach: sinon.spy(),
                destroy: sinon.spy(),
                update: sinon.spy()
            };
            current = {
                path: '/foo',
                pathPattern: '/foo',
                url: '/foo?a=b',
                options: {}
            };
            prev = {
                path: '/bar',
                pathPattern: '/bar',
                url: '/bar?d=c',
                options: {}
            };
        });
        afterEach(function() {
            router.reset.restore();
            router.redirect.restore();
            router.stop.restore();
            history.back.restore();
        });
        describe('.regist()', function() {
            it('should throw with undefined key', function() {
                function fn() {
                    action.regist();
                }
                expect(fn).to.throw(/illegal action url/);
            });
            it('should throw with illegal service', function() {
                function fn() {
                    action.regist('key', {});
                }
                expect(fn).to.throw(/illegal service/);
            });
            it('should throw upon illegal url', function() {
                function fn() {
                    action.regist();
                }
                expect(fn).to.throw(/illegal action url/);
            });
            it('should not regist illegal service', function() {
                action.regist('key', fooService);
                expect(action.exist('key')).to.be.true;
            });
        });
        describe('.unregist()', function() {
            beforeEach(function(){
                action.regist('key', fooService);
            });
            it('should throw with undefined key', function() {
                function fn() {
                    action.unregist();
                }
                expect(fn).to.throw(/illegal action url/);
            });
            it('should throw not when registered', function() {
                function fn() {
                    action.unregist('not-registered');
                }
                expect(fn).to.throw(/path not registered/);
            });
            it('should un-register', function() {
                action.unregist('key');
                expect(action.exist('key')).to.be.false;
            });
        });
        describe('.dispatch()', function() {
            beforeEach(function() {
                action.regist('/foo', fooService);
                action.regist('/bar', barService);
                action.regist('/person/:id', fooService);
                action.regist(/person\/\d+/, barService);
            });
            it('should call create/attach/detach/destroy with correct arguments', function() {
                return action.dispatch(current, prev).then(function(){
                    expect(fooService.create).to.have.been.calledWith(current, prev);
                    expect(fooService.attach).to.have.been.calledWith(current, prev);
                    expect(barService.detach).to.have.been.calledWith(current, prev);
                    expect(barService.destroy).to.have.been.calledWith(current, prev);
                });
            });
            it('should call detach,create,destroy,attach in a sequence', function() {
                return action.dispatch(current, prev).then(function(){
                    expect(barService.detach).to.have.been.called;
                    expect(fooService.create).to.have.been.calledAfter(barService.detach);
                    expect(barService.destroy).to.have.been.calledAfter(fooService.create);
                    expect(fooService.attach).to.have.been.calledAfter(barService.destroy);
                });
            });
            it('should not call create,destroy,attach if dispatch re-started', function() {
                barService.detach = function(){};
                sinon.stub(barService, 'detach', function(){
                    return new Promise(function(resolve, reject){
                        setTimeout(resolve, 100);
                    });
                });
                var firstDispatch = action.dispatch(current, prev);
                var secondDispatch = new Promise(function(resolve, reject){
                    setTimeout(function(){
                        action.dispatch(prev, current).then(resolve).catch(reject);
                    }, 10);
                });
                return Promise
                    .all([firstDispatch, secondDispatch])
                    .then(function(){
                        // bar -> foo
                        expect(barService.detach).to.have.been.calledOnce;
                        expect(fooService.create).to.have.not.been.called;
                        expect(barService.destroy).to.have.not.been.called;
                        expect(fooService.attach).to.have.not.been.called;
                        // foo -> bar
                        expect(fooService.detach).to.have.been.calledOnce;
                        expect(barService.create).to.have.been.calledOnce;
                        expect(fooService.destroy).to.have.been.calledOnce;
                        expect(barService.attach).to.have.been.calledOnce;
                    });
            });
            it('should await when create returns a promise', function(){
                var createdSpy = sinon.spy();
                fooService.create = function(){
                    return new Promise(function(resolve, reject){
                        setTimeout(function(){
                            createdSpy();
                            resolve('created');
                        }, 100);
                    });
                };
                return action.dispatch(current, prev).then(function(){
                    expect(barService.destroy).to.have.been.calledAfter(createdSpy);
                });
            });
            it('should abort when create throws', function(){
                var createdSpy = sinon.spy();
                fooService.create = function(){
                    throw 'foo';
                };
                return action.dispatch(current, prev).catch(function(e){
                    expect(e).to.equal('foo');
                }).then(function(){
                    expect(barService.destroy).to.not.have.been.called;
                });
            });
            it('should abort when create returns a rejected promise', function(){
                var createdSpy = sinon.spy();
                fooService.create = function(){
                    return Promise.reject('foo')
                };
                return action.dispatch(current, prev).catch(function(e){
                    expect(e).to.equal('foo');
                }).then(function(){
                    expect(barService.destroy).to.not.have.been.called;
                });
            });
            it('should init when options.src === sync', function() {
                return action.dispatch({
                    path: '/foo',
                    pathPattern: '/foo',
                    options: {
                        src: 'sync'
                    }
                }, {}).then(function(){
                    return expect(fooService.create).to.have.been.called;
                });
            });
            it('should retrieve service registered as regexp url', function() {
                return action.dispatch({
                    path: '/person/13',
                    pathPattern: '/person/:id',
                    url: '/person/13?d=c',
                    options: {}
                }, prev).then(function(){
                    expect(fooService.create).to.have.been.called;
                    expect(fooService.attach).to.have.been.called;
                });
            });
        });
        describe('.isIndexPage()', function(){
            beforeEach(function() {
                action.init();
                action.regist('/foo', fooService);
                action.regist('/bar', barService);
            });
            it('should set as true initally', function() {
                expect(action.isIndexPage()).to.be.true;
            });
            it('should return false when dispatched to another service', function() {
                return action.dispatch(current, prev).then(function(){
                    expect(action.isIndexPage()).to.be.false;
                });
            });
            it('should return true when dispatched to sync', function() {
                current.options.src = 'sync';
                return action.dispatch(current, prev).then(function(){
                    expect(action.isIndexPage()).to.be.true;
                });
            });
        });
        describe('.back()', function() {
            it('should call history.back()', function() {
                action.back({});
                expect(history.back).to.have.been.called;
            });
            it('should set options.src to "back"', function() {
                action.back({});
                var current = {options: {}};
                action.dispatch(current, {});
                expect(current.options.src).to.equal('back');
            });
            it('should set options.src to "back" only once', function() {
                action.back();
                var second = {options: {}};
                action.dispatch({options: {}}, {});
                action.dispatch(second, {});
                expect(second.options.src).to.not.equal('back');
            });
        });
        describe('.remove()', function() {
            it('should remove properly', function() {
                action.regist('bar', fooService);
                action.remove('bar');
                expect(action.exist('bar')).to.be.false;
            });
        });
        describe('.redirect()', function() {
            beforeEach(function() {
                action.regist('/foo', fooService);
                action.regist('/bar', barService);
                action.start({
                    root: '/root/page'
                });
            });
            it('should call router with correct arguments', function() {
                var url = 'xx',
                    query = 'bb',
                    options = {};
                action.redirect(url, query, options);
                expect(router.redirect).to.have.been.calledWith(url, query, options);
            });
            it('should pass stage data to next dispatch', function() {
                action.redirect('/foo', 'bb', {}, {foo: 'bar'});
                return action.dispatch({pathPattern: '/foo'}, {}).then(function(){
                    expect(fooService.create.args[0][2]).to.deep.equal({
                        foo: 'bar'
                    });
                });
            });
            it('should redirect to root page for sfr://index', function() {
                current.src = 'sync';
                action.dispatch(current, prev);
                action.redirect('sfr://index');
                expect(router.redirect).to.have.been.calledWith('/foo?a=b');
            });
            it('should not pass stage data to further dispatches', function() {
                action.redirect('/foo', 'bb', {}, {foo: 'bar'});
                var current = {pathPattern: '/foo'};
                return action.dispatch(current, {}).then(function(){
                    fooService.create.reset();
                    return action.dispatch(current, {});
                })
                .then(function(){
                    expect(fooService.create.args[0][2].foo).to.be.undefined;
                });
            });
        });
        describe('.reset()', function() {
            beforeEach(function() {
                action.regist('/foo', fooService);
                action.regist('/bar', barService);
            });
            it('should call router with correct arguments', function() {
                var url = 'xx',
                    query = 'bb',
                    options = {};
                action.reset(url, query, options);
                expect(router.reset).to.have.been.calledWith(url, query, options);
            });
            it('should pass stage data to next dispatch', function() {
                action.reset('/foo', 'bb', {}, {foo: 'bar'});
                return action.dispatch({pathPattern: '/foo'}, {}).then(function(){
                    expect(fooService.create.args[0][2]).to.deep.equal({
                        foo: 'bar'
                    });
                });
            });
            it('should not pass stage data to further dispatches', function() {
                action.reset('/foo', 'bb', {}, {foo: 'bar'});
                var current = {pathPattern: '/foo'};
                return action.dispatch(current, {}).then(function(){
                    fooService.create.reset();
                    return action.dispatch(current, {});
                })
                .then(function(){
                    expect(fooService.create.args[0][2].foo).to.be.undefined;
                });
            });
        });
        describe('.start(), .stop()', function() {
            var a;
            beforeEach(function() {
                var link = '/foo',
                    options = {
                        foo: 'bar'
                    };
                a = document.createElement('a');
                a.setAttribute('data-sf-href', 'foo');
                a.setAttribute('data-sf-options', JSON.stringify(options));
                document.body.append(a);
                sinon.stub(action, 'config');
            });
            afterEach(function() {
                a.remove();
                action.config.restore();
            });
            it('should support redirect via data-sf-href', function() {
                action.start();
                a.click();
                expect(router.redirect).to.have.been.calledWith('foo', null);
            });
            it('should not redirect data-sf-href after .stop() called', function() {
                action.start();
                action.stop();
                a.click();
                expect(router.redirect).to.have.not.been.called;
            });
            it('should call router.stop() when .stop() called', function() {
                action.stop();
                expect(router.stop).to.have.been.called;
            });
            it('should support redirect options via data-sf-options', function() {
                action.start();
                a.click();
                var options = {
                    foo: 'bar',
                    src: 'hijack'
                };
                expect(router.redirect).to.have.been.
                calledWith('foo', null, options);
            });
            it('should use empty options when data-sf-options illegal', function() {
                a.setAttribute('data-sf-options', '{fdafda}');
                action.start();
                a.click();
                expect(router.redirect).to.have.been.calledWith('foo', null, {
                    src: 'hijack'
                });
            });
            it('should not call .config() when no arguments given', function() {
                action.start();
                expect(action.config).to.have.not.been.called;
            });
            it("should call .config() when there's arguments given", function() {
                var opts = {root: '/bar'};
                action.start(opts);
                expect(action.config).to.have.been.calledWith(opts);
            });
        });
        describe('.config()', function() {
            beforeEach(function(){
                sinon.stub(router, 'config');
            });
            afterEach(function(){
                router.config.restore();
            });
            it('should call router.config', function() {
                var opts = {root: '/foo'};
                action.config(opts);
                expect(router.config).to.have.been.calledWith(opts);
            });
        });
        describe('.update()', function() {
            beforeEach(function() {
                action.regist('/foo', fooService);
            });
            it('should call router.reset()', function() {
                history.replaceState({}, 'title', '/foo');
                action.update('/foo');
                expect(router.reset).to.have.been.called;
            });
            it('should call serviceObject.update()', function() {
                history.replaceState({}, 'title', '/bar/foo');
                var options = {
                    foo: 'bar'
                };
                var extra = {
                    container: 'container',
                    view: 'view'
                };
                return action.update('url', 'query', options, extra).then(function(){
                    expect(fooService.update).to.have.been.called;
                    expect(fooService.update).to.have.been.calledWithMatch({}, {
                        from: {
                            url: '/foo'
                        },
                        to: {
                            path: '/foo',
                            url: 'url'
                        },
                        extra: extra
                    });
                });
            });
        });
    });
});

