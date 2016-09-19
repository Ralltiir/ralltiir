/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/view/viewFactory.js
 */

define(['../src/view/viewFactory', '../src/view/cache', '../src/view/view'], function(viewFactory, cache, view) {
    describe('view/viewFactory', function() {
        var instance = {};
        beforeEach(function() {
            viewFactory.clear();
        });
        describe('.create()', function() {
            it('should return object when key undefined', function() {
                expect(viewFactory.create()).to.be.an('object');
            });
            it('should call cache.get() when key specified', function() {
                sinon.stub(cache, 'get').returns(instance);
                expect(viewFactory.create('key')).to.equal(instance);
                expect(cache.get).calledWith('View', 'key');
                cache.get.restore();
            });
            it('should not call cache.get() in latter access', function() {
                viewFactory.create('key');
                sinon.stub(cache, 'get');
                viewFactory.create('key');
                expect(cache.get).to.not.have.been.called;
                cache.get.restore();
            });
            it('should call cache.set() if cache miss', function() {
                sinon.stub(cache, 'get').returns(false);
                sinon.stub(cache, 'set');
                var obj = viewFactory.create('key');
                expect(cache.set).to.have.been.calledWith('View', 'key', obj);
                cache.get.restore();
                cache.set.restore();
            });
        });
        describe('.get()', function() {
            it('should return false when key undefined', function() {
                expect(viewFactory.get()).to.equal(false);
            });
            it('should return instance when key exist', function() {
                var obj = viewFactory.create('key');
                expect(viewFactory.get('key')).to.equal(obj);
            });
            it('should return undefined when key not exist', function() {
                expect(viewFactory.get('key')).to.equal(undefined);
            });
        });
        describe('.destroy()', function() {
            var scope = {
                    from: {
                        url: 'key'
                    }
                },
                obj;
            beforeEach(function() {
                obj = viewFactory.create(scope.from.url);
                sinon.stub(obj, 'destroy');
                viewFactory.destroy(scope);
            });
            afterEach(function() {
                obj.destroy.restore();
            });
            it('should delete view isntance', function() {
                expect(viewFactory.get('key')).to.equal(undefined);
            });
            it('should call view.destroy', function() {
                expect(obj.destroy).to.have.been.calledWith(scope);
            });
        });
    });
});
