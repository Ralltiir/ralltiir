/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/view/cache.js
 */

define(['view/cache'], function(cache) {
    describe('view/cache', function() {
        beforeEach(function() {
            cache.clear('name');
        });
        describe('.create()', function() {
            it('should not throw when options undefined', function() {
                expect(function() {
                    cache.create('name');
                }).to.not.throw();
            });
            it('should use default CACHE_NUM as 3', function() {
                expect(cache.create('name').CACHE_NUM).to.equal(3);
            });
            it('should respect CACHE_NUM option', function() {
                expect(cache.create('name', {
                    CACHE_NUM: 8
                }).CACHE_NUM).to.equal(8);
            });
        });
        describe('.get()', function() {
            it('should return false before cache created', function() {
                expect(cache.get('name', 'key')).to.equal(false);
            });
            it('should return false when cache list empty', function() {
                cache.create('name');
                expect(cache.get('name', 'key2')).to.equal(false);
            });
            it('should hit when exist', function() {
                cache.create('name');
                cache.set('name', 'key', 'val');
                expect(cache.get('name', 'key')).to.equal('val');
            });
        });
        describe('.set()', function() {
            beforeEach(function() {
                cache.create('name', {
                    CACHE_NUM: 2
                });
            });
            it('should return false before cache created', function() {
                expect(cache.set('not exist name', 'key', 'val')).to.equal(false);
            });
            it('should contain 2 items at least', function() {
                cache.set('name', 'key1', 'val1');
                cache.set('name', 'key2', 'val2');
                expect(cache.get('name', 'key1')).to.equal('val1');
                expect(cache.get('name', 'key2')).to.equal('val2');
            });
            it('should contain 2 items at most', function() {
                cache.set('name', 'key1', 'val1');
                cache.set('name', 'key2', 'val2');
                cache.set('name', 'key3', 'val3');
                expect(cache.get('name', 'key1')).to.equal(false);
                expect(cache.get('name', 'key2')).to.equal('val2');
                expect(cache.get('name', 'key3')).to.equal('val3');
            });
            it('should replace item with the same key', function() {
                cache.set('name', 'key1', 'val1');
                cache.set('name', 'key2', 'val2');
                cache.set('name', 'key1', 'val3');
                expect(cache.get('name', 'key1')).to.equal('val3');
            });
            it('should update position when item replaced', function() {
                cache.set('name', 'key1', 'val1');
                cache.set('name', 'key2', 'val2');
                cache.set('name', 'key1', 'val');
                cache.set('name', 'key3', 'val3');
                expect(cache.get('name', 'key1')).to.equal('val');
                expect(cache.get('name', 'key2')).to.equal(false);
                expect(cache.get('name', 'key3')).to.equal('val3');
            });
            it('should call item.destroy() after droped', function() {
                var val1 = {
                    destroy: sinon.spy()
                };
                cache.set('name', 'key1', val1);
                cache.set('name', 'key2', 'val2');
                cache.set('name', 'key3', 'val3');
                expect(val1.destroy).to.have.been.called;
            });
        });
        describe('.remove()', function() {
            beforeEach(function() {
                cache.create('name', {
                    CACHE_NUM: 2
                });
                cache.set('name', 'key', 'val');
            });
            it('should remove item indeed', function() {
                cache.remove('name', 'key');
                expect(cache.get('name', 'key')).to.equal(false);
            });
            it('should return false on fail', function() {
                expect(cache.remove('name', 'key1')).to.equal(false);
                expect(cache.remove('name1', 'key')).to.equal(false);
            });
            it('should return true on success', function() {
                expect(cache.remove('name', 'key')).to.equal(true);
            });
        });
    });
});
