/**
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/view/cache.js
 */

/* eslint-env mocha */

/* eslint max-nested-callbacks: ["error", 6] */

/* globals sinon: true */

define(['utils/cache'], function (cache) {
    describe('view/cache', function () {
        beforeEach(function () {
            cache.clear();
        });
        describe('.create()', function () {
            it('should not throw when options undefined', function () {
                expect(function () {
                    cache.create('name');
                }).to.not.throw();
            });
            it('should return an instance using the created name', function () {
                var c = cache.create('name');
                c.set('key', 'val');
                expect(c.get('key')).to.equal('val');
            });
            it('should return false when namespace not exist', function () {
                expect(cache.has('name')).to.be.false;
            });
            it('should return true when namespace exist', function () {
                cache.create('name');
                expect(cache.has('name')).to.be.true;
            });
        });
        describe('.get()', function () {
            it('should throw when namespace undefined', function () {
                expect(function () {
                    cache.get('name', 'key');
                }).to.throw(/namespace name undefined/);
            });
            it('should return undefined when cache list empty', function () {
                cache.create('name');
                expect(cache.get('name', 'key2')).to.equal(undefined);
            });
            it('should hit when exist', function () {
                cache.create('name');
                cache.set('name', 'key', 'val');
                expect(cache.get('name', 'key')).to.equal('val');
            });
        });
        describe('.set()', function () {
            var onRemove;
            beforeEach(function () {
                onRemove = sinon.spy();
                cache.create('name', {
                    limit: 2,
                    onRemove: onRemove
                });
            });
            describe('cache limit', function () {
                it('should return throw when namespace undefined', function () {
                    expect(function () {
                        cache.set('notdef', 'key', 'val');
                    }).to.throw(/namespace notdef undefined/);
                });
                it('should contain 2 items at least', function () {
                    cache.set('name', 'key1', 'val1');
                    cache.set('name', 'key2', 'val2');
                    expect(cache.get('name', 'key1')).to.equal('val1');
                    expect(cache.get('name', 'key2')).to.equal('val2');
                });
                it('should contain 2 items at most', function () {
                    cache.set('name', 'key1', 'val1');
                    cache.set('name', 'key2', 'val2');
                    cache.set('name', 'key3', 'val3');
                    expect(cache.get('name', 'key1')).to.equal(undefined);
                    expect(cache.get('name', 'key2')).to.equal('val2');
                    expect(cache.get('name', 'key3')).to.equal('val3');
                });
                it('should replace item with the same key', function () {
                    cache.set('name', 'key1', 'val1');
                    cache.set('name', 'key2', 'val2');
                    cache.set('name', 'key1', 'val3');
                    expect(cache.get('name', 'key1')).to.equal('val3');
                });
                it('should update position when item replaced', function () {
                    cache.set('name', 'key1', 'val1');
                    cache.set('name', 'key2', 'val2');
                    cache.set('name', 'key1', 'val');
                    cache.set('name', 'key3', 'val3');
                    expect(cache.get('name', 'key1')).to.equal('val');
                    expect(cache.get('name', 'key2')).to.equal(undefined);
                    expect(cache.get('name', 'key3')).to.equal('val3');
                });
            });
            describe('LRU strategy', function () {
                it('should remove the first by default', function () {
                    cache.set('name', 'key1', 'val1');
                    cache.set('name', 'key2', 'val2');
                    expect(onRemove).to.not.have.been.called;
                    cache.set('name', 'key3', 'val3');
                    expect(onRemove).to.have.been.firstCall;
                    expect(onRemove).to.have.been.calledWith('val1', 'key1', true);
                    cache.set('name', 'key4', 'val4');
                    expect(onRemove).to.have.been.secondCall;
                    expect(onRemove).to.have.been.calledWith('val2', 'key2', true);
                });
                it('should update the position onece accessed', function () {
                    cache.set('name', 'key1', 'val1');
                    cache.set('name', 'key2', 'val2');
                    cache.get('name', 'key1');
                    cache.set('name', 'key3', 'val3');
                    expect(onRemove).to.have.been.calledWith('val2', 'key2', true);
                    cache.set('name', 'key4', 'val4');
                    expect(onRemove).to.have.been.calledWith('val2', 'key2', true);
                });
            });
        });
        describe('.remove()', function () {
            var onRemove;
            beforeEach(function () {
                onRemove = sinon.spy();
                cache.create('name', {
                    limit: 2,
                    onRemove: onRemove
                });
                cache.set('name', 'key', 'val');
            });
            it('should remove item', function () {
                cache.remove('name', 'key');
                expect(cache.get('name', 'key')).to.be.undefined;
            });
            it('should call onRemove()', function () {
                cache.remove('name', 'key');
                expect(onRemove).to.have.been.calledWith('val', 'key', false);
            });
            it('should not be silent when key not exist', function () {
                expect(function () {
                    cache.remove('name', 'key1');
                }).to.not.throw();
            });
            it('should throw when namespace undefined', function () {
                expect(function () {
                    cache.remove('name1', 'key');
                }).to.throw(/namespace name1 undefined/);
            });
            it('should return the scoped cache', function () {
                var c = cache.remove('name', 'key');
                expect(c.remove).to.be.a.function;
                expect(c.set).to.be.a.function;
                expect(c.get).to.be.a.function;
                expect(c.contains).to.be.a.function;
            });
        });
        describe('.clear()', function () {
            beforeEach(function () {
                cache.create('name');
                cache.create('another');
            });
            it('should clear a namespace', function () {
                cache.set('name', 'foo', 'foo');
                cache.clear('name');
                expect(cache.contains('name', 'foo')).to.be.false;
            });
            it('should clear all namespaces', function () {
                cache.set('name', 'foo', 'foo');
                cache.clear();
                expect(cache.contains('name')).to.be.false;
            });
        });
        describe('.contains', function () {
            it('should return false when namespace not exists', function () {
                expect(cache.contains('name')).to.be.false;
                expect(cache.contains('name', 'key')).to.be.false;
            });
            it('should return true when namespace exists', function () {
                cache.create('name');
                expect(cache.contains('name')).to.be.true;
            });
            it('should return false when key not exists', function () {
                cache.create('name');
                expect(cache.contains('name', 'key')).to.be.false;
            });
            it('should return true when key exists', function () {
                cache.create('name');
                cache.set('name', 'key', 'val');
                expect(cache.contains('name', 'key')).to.be.true;
            });
        });
        describe('.using()', function () {
            it('should throw when namespace undefined', function () {
                expect(function () {
                    cache.using('view');
                }).to.throw(/undefined/);
            });
            it('should get scoped key', function () {
                cache.create('view');
                cache.set('view', 'key', 'val');
                expect(cache.using('view').get('key')).to.equal('val');
            });
            it('should set scoped key', function () {
                cache.create('view');
                cache.using('view').set('bar', 'BAR');
                expect(cache.get('view', 'bar')).to.equal('BAR');
            });
        });
        describe('.rename()', function () {
            it('should throw when namespace undefined', function () {
                expect(function () {
                    cache.rename('view', 'foo', 'bar');
                }).to.throw(/namespace view undefined/);
            });
            it('should rename when target not defined', function () {
                var c = cache.create('view');
                c.set('foo', 'FOO');
                c.rename('foo', 'bar');
                expect(c.get('foo')).to.equal(undefined);
                expect(c.get('bar')).to.equal('FOO');
            });
            it('should override when target exist', function () {
                var c = cache.create('view');
                c.set('foo', 'FOO');
                c.set('bar', 'BAR');
                c.rename('foo', 'bar');
                expect(c.get('foo')).to.equal(undefined);
                expect(c.get('bar')).to.equal('FOO');
            });
        });
    });
});
