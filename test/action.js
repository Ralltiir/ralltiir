/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/action.js
 */

define(['../src/action', '../router/router', '../src/utils/promise.js'], function(action, router) {
    describe('action/action', function() {
        /*
         * Stub 外部对象
         */
        var serviceStub = {
            create: function(){},
            update: function(){},
            attach: function(){},
            detach: function(){},
            destroy: function(){}
        };
        beforeEach(function() {
            action.clear();
            sinon.stub(router, 'reset');
            sinon.stub(router, 'redirect');
            sinon.stub(history, 'back');
        });
        afterEach(function() {
            router.reset.restore();
            router.redirect.restore();
            history.back.restore();
        });
        describe('.regist()', function() {
            it('should throw with undefined key', function() {
                function fn() {
                    action.regist();
                }
                expect(fn).to.throw(/illegal action name/);
            });
            it('should throw with illegal service', function() {
                function fn() {
                    action.regist('key', {});
                }
                expect(fn).to.throw(/illegal service/);
            });
            it('should throw upon illegal name', function() {
                function fn() {
                    action.regist();
                }
                expect(fn).to.throw(/illegal action name/);
            });
            it('should not regist illegal service', function() {
                var service = {
                    create: function() {},
                    attach: function() {},
                    detach: function() {},
                    destroy: function() {},
                    update: function() {}
                };
                action.regist('key', service);
                expect(action.exist('key')).to.be.true;
            });
        });
        describe('.dispatch()', function() {
            var fooService, barService, current, prev;
            beforeEach(function() {
                action.clear();
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
                action.regist('foo', fooService);
                action.regist('bar', barService);
                current = {
                    path: 'foo',
                    url: '/foo',
                    options: {}
                };
                prev = {
                    path: 'bar',
                    url: '/bar',
                    options: {}
                };
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
                    path: 'foo',
                    options: {
                        src: 'sync'
                    }
                }, {}).then(function(){
                    return expect(fooService.create).to.have.been.called;
                });
            });
            it('should destroy prev action', function() {
                action.dispatch(current, prev).then(function(){
                    return expect(barService.destroy).to.have.been.called;
                });
            });
        });
        describe('.remove()', function() {
            it('should remove properly', function() {
                action.regist('bar', serviceStub);
                action.remove('bar');
                expect(action.exist('bar')).to.be.false;
            });
        });
        describe('.redirect()', function() {
            it('should call router with correct arguments', function() {
                var url = 'xx',
                    query = 'bb',
                    options = {};
                action.redirect(url, query, options);
                expect(router.redirect).to.have.been.calledWith(url, query, options);
            });
        });
        describe('.back()', function() {
            it('should call history.back()', function() {
                action.back({});
                expect(history.back).to.have.been.called;
            });
        });
        describe('.redirect()', function() {
            it('should call router with correct arguments', function() {
                var url = 'xx',
                    query = 'bb',
                    options = {};
                action.reset(url, query, options);
                expect(router.reset).to.have.been.calledWith(url, query, options);
            });
        });
        describe('.start()', function() {
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
            });
            afterEach(function() {
                a.remove();
            });
            it('should support redirect via data-sf-href', function() {
                action.start();
                a.click();
                expect(router.redirect).to.have.been.calledWith('foo', null);
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
        });
        describe('.update()', function() {
            var option;
            beforeEach(function() {
                option = {
                    create: sinon.spy(),
                    attach: sinon.spy(),
                    detach: sinon.spy(),
                    destroy: sinon.spy(),
                    update: sinon.spy()
                };
                action.clear();
                action.regist('/foo', option);
            });
            it('should call router.reset()', function() {
                action.update();
                expect(router.reset).to.have.been.called;
            });
            it('should call serviceObject.update()', function() {
                history.replaceState({}, 'title', '/bar/foo');
                var options = {
                    foo: 'bar'
                };
                var extend = {
                    container: 'container',
                    view: 'view'
                };
                action.update('url', 'query', options, extend);
                expect(option.update).to.have.been.called;
                expect(option.update).to.have.been
                    .calledWithMatch({
                        path: '/foo',
                        url: 'url',
                        prevUrl: '/foo',
                        query: 'query',
                        options: options,
                        container: 'container',
                        view: 'view'
                    });
            });
        });
    });
});

