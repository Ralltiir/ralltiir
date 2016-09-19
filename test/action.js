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
            it('should regist actions', function() {
                action.regist('key', {});
                expect(action.exist('key')).to.be.true;
            });
        });
        describe('.run()', function() {
            var option;
            beforeEach(function() {
                option = {
                    do: sinon.spy(),
                    before: sinon.spy(),
                    after: sinon.spy(),
                    destroy: sinon.spy()
                };
                action.regist('foo', option);
            });
            it('should call do with correct arguments', function() {
                var current = {
                        path: 'foo',
                        url: '/foo'
                    },
                    prev = {};
                action.run(current, prev);
                expect(option.do).to.have.been.calledWith(current, prev);
            });
            it('should call before,do,after in a sequence', function() {
                action.run({
                    path: 'foo',
                    url: '/foo'
                }, {});
                expect(option.before).to.have.been.called;
                expect(option.do).to.have.been.calledAfter(option.before);
                expect(option.after).to.have.been.calledAfter(option.do);
            });
            it('should skip init when options.src === sync', function() {
                action.run({
                    url: '/home',
                    options: {
                        src: 'sync'
                    }
                }, {});
                expect(option.do).to.not.have.been.called;
            });
            it('should use _indexAction when switched back', function() {
                var indexOption = {
                    do: sinon.spy()
                };
                action.regist('/index', indexOption);
                action.run({
                    url: '/home',
                    path: '/not/index'
                }, {});
                expect(indexOption.do).to.have.been.called;
            });
            it('should destroy prev action', function() {
                action.regist('bar', option);
                action.run({
                    path: 'bar',
                    url: '/bar'
                }, {
                    path: 'foo',
                    url: '/foo'
                });
                expect(option.destroy).to.have.been.called;
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
                action.run(current, {});
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
                    update: sinon.spy()
                };
                action.regist('/foo', option);
            });
            it('should call router.reset()', function() {
                action.update();
                expect(router.reset).to.have.been.called;
            });
            it('should call action.update()', function() {
                history.pushState({}, 'title', '/bar/foo');
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
