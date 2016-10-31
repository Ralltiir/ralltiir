/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/action.js
 */

define(['../src/action', '../router/router'], function(action, router) {
    describe('action/action', function() {
        /*
         * Stub 外部对象
         */
        before(function() {
            action.clear();
            sinon.stub(router, 'reset');
            sinon.stub(router, 'redirect');
            sinon.stub(history, 'back');
        });
        beforeEach(function() {
            router.reset.reset();
            router.redirect.reset();
            history.back.reset();
        });
        after(function() {
            router.reset.restore();
            router.redirect.restore();
            history.back.restore();
        });
        describe('.regist()', function() {
            it('should not throw with undefined option', function() {
                function fn() {
                    action.regist('key');
                }
                expect(fn).to.throw(/illegal action option/);
            });
            it('should not throw with empty option', function() {
                function fn() {
                    action.regist('key', {});
                }
                expect(fn).to.not.throw();
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
            it('should call create with correct arguments', function() {
                return action.dispatch(current, prev).then(function(){
                    return expect(fooService.create).to
                        .have.been.calledWith(current, prev);
                });
            });
            it('should call attach with correct arguments', function() {
                return action.dispatch(current, prev).then(function(){
                    return expect(fooService.attach).to
                        .have.been.calledWith(current, prev);
                });
            });
            it('should call detach with correct arguments', function() {
                return action.dispatch(current, prev).then(function(){
                    return expect(barService.detach).to
                        .have.been.calledWith(current, prev);
                });
            });
            it('should call destroy with correct arguments', function() {
                return action.dispatch(current, prev).then(function(){
                    return expect(barService.destroy).to
                        .have.been.calledWith(current, prev);
                });
            });
            it('should call detach,create,destroy,attach in a sequence', function() {
                return action.dispatch(current, prev).then(function(){
                    return expect(barService.detach).to.have.been.called;
                }).then(function(){
                    return expect(fooService.create).to
                        .have.been.calledAfter(barService.detach);
                }).then(function(){
                    return expect(barService.destroy).to
                        .have.been.calledAfter(fooService.create);
                }).then(function(){
                    return expect(fooService.attach).to
                        .have.been.calledAfter(barService.destroy);
                });
            });
            it('should skip init when options.src === sync', function() {
                return action.dispatch({
                    url: '/home',
                    options: {
                        src: 'sync'
                    }
                }, {}).then(function(){
                    return expect(fooService.create).to.not.have.been.called;
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
                action.regist('bar', {});
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
            it('should set _options.src', function() {
                action.back({});
                var current = {};
                action.dispatch(current, {});
                expect(current.options.src).to.equal('back');
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
            var $a;
            beforeEach(function() {
                var link = '/foo',
                    options = {
                        foo: 'bar'
                    };
                $a = $('<a>')
                    .data('sf-href', 'foo')
                    .data('sf-options', JSON.stringify(options))
                    .appendTo('body');
            });
            afterEach(function() {
                $a.remove();
            });
            it('should support redirect via data-sf-href', function() {
                action.start();
                $a.click();
                expect(router.redirect).to.have.been.calledWith('foo', null);
            });
            it('should support redirect options via data-sf-options', function() {
                action.start();
                $a.click();
                var options = {
                    foo: 'bar',
                    src: 'hijack'
                };
                expect(router.redirect).to.have.been.
                calledWith('foo', null, options);
            });
            it('should use empty options when data-sf-options illegal', function() {
                $a.data('sf-options', '{fdafda}');
                action.start();
                $a.click();
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
        describe('.config()', function() {
            it('should return correct options', function() {
                var c = action.config({
                    foo: 'bar'
                });
                expect(c.foo).to.equal('bar');
            });
        });
    });
});

