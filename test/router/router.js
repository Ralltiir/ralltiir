/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/router/router.js
 */

define(['src/router/router', 'src/router/router/controller', 'src/router/router/config'], function(Router, Ctrl, Config) {
    describe('router/router', function() {
        describe('.reset(), .redirect()', function() {
            beforeEach(function() {
                sinon.stub(Ctrl, 'reset');
                sinon.stub(Ctrl, 'redirect');
            });
            afterEach(function() {
                Ctrl.reset.restore();
                Ctrl.redirect.restore();
            });
            it('should call controller reset', function() {
                Router.reset('url', 'query', 'options');
                expect(Ctrl.reset).to.have.been.calledWith('url', 'query', 'options');
            });
            it('should call controller redirect', function() {
                Router.redirect('url', 'query', 'options');
                expect(Ctrl.redirect).to.have.been.calledWith('url', 'query', 'options');
            });
        });
        describe('.config()', function() {
            before(function() {
                Router.config({
                    foo: 'bar',
                    root: 'foo/bar/'
                });
            });
            after(function() {
                delete Config.foo;
                Config.root = '';
            });
            it('should merge options into globalConfig', function() {
                expect(Config.foo).to.equal('bar');
            });
            it('should merge options into globalConfig', function() {
                expect(Config.root).to.equal('/foo/bar');
            });
        });
        describe('.add(), .remove(), .clear(), .exist()', function(){
            beforeEach(function(){
                Router.clear();
            });
            it('should throw when add multiple times', function(){
                function fn(){
                    Router.add('/foo', function(){}, null);
                    Router.add('/foo', function(){}, null);
                }
                expect(fn).to.throw();
            });
            it('should add rule', function(){
                Router.add('/foo', function(){}, null);
                expect(Router.exist('/foo')).to.be.true;
            });
            it('should remove rule', function(){
                Router.add('/foo', function(){}, null);
                Router.remove('/foo');
                expect(Router.exist('/foo')).to.be.false;
            });
            it('should clear rule', function(){
                Router.add('/foo', function(){}, null);
                Router.clear('/foo');
                expect(Router.exist('/foo')).to.be.false;
            });
        });
        describe('.start()', function(){
            var fn, conf = {
                root: '/foo'
            };
            beforeEach(function(){
                history.replaceState({}, 'title', '/foo');
                fn = sinon.spy();
                Router.add('/foo', fn);
            });
            afterEach(function(){
                Router.clear();
            });
            it('should set options via exports.config', function(){
                sinon.stub(Router, 'config');
                Router.start(conf);
                expect(Router.config).to.have.been.calledWith(conf);
                Router.config.restore();
            });
        });
    });
});
