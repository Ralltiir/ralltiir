/*
 * @author yangjun14(yangjvn@126.com)
 * @file 测试src/utils/underscore.js
 */

define(['src/utils/underscore'], function(_) {
    describe('underscore', function() {
        var obj = {
            foo: 'bar',
            bar: false
        };
        var arr = ['foo', 'bar'];

        function func(a, b, c) {
            return a + b + c;
        }
        describe('.keysIn()', function() {
            it('should return array of keys', function() {
                expect(_.keysIn(obj)).to.deep.equal(['foo', 'bar']);
            });
        });
        describe('.assign', function() {
            it('should handle null dst', function() {
                expect(_.assign(null, {
                    foo: 'bar'
                })).to.deep.equal({
                    foo: 'bar'
                });
            });
            it('should assign 2 objects', function() {
                var src = {
                    foo: 'foo',
                    bar: 'bar'
                };
                var dst = {
                    foo: 'bar',
                    kaa: 'kaa'
                };
                expect(_.assign(dst, src)).to.deep.equal({
                    foo: 'foo',
                    bar: 'bar',
                    kaa: 'kaa'
                });
            });
            it('should assign 3 objects', function() {
                expect(_.assign({
                    foo: 'foo'
                }, {
                    bar: 'bar'
                }, {
                    car: 'car'
                })).to.deep.equal({
                    foo: 'foo',
                    bar: 'bar',
                    car: 'car'
                });
            });
        });
        describe('.defaults()', function() {
            it('should handle null dst', function() {
                expect(_.defaults(null, {
                    foo: 'bar'
                })).to.deep.equal({
                    foo: 'bar'
                });
            });
            it('should merge 2 objects', function() {
                var src = {
                    foo: 'foo',
                    bar: 'bar'
                };
                var dst = {
                    foo: 'bar',
                    kaa: 'kaa'
                };
                expect(_.defaults(dst, src)).to.deep.equal({
                    kaa: 'kaa',
                    foo: 'bar',
                    bar: 'bar'
                });
            });
            it('should merge 3 objects', function() {
                expect(_.defaults({
                    foo: 'foo'
                }, {
                    bar: 'bar'
                }, {
                    car: 'car'
                })).to.deep.equal({
                    foo: 'foo',
                    bar: 'bar',
                    car: 'car'
                });
            });
        });
        describe('.defaultsDeep()', function() {
            it('should handle null dst', function() {
                expect(_.defaultsDeep(null, {
                    foo: 'bar'
                })).to.deep.equal({
                    foo: 'bar'
                });
            });
            it('should replace null value', function() {
                expect(_.defaultsDeep({
                    foo: {
                        foo: 'foo'
                    }
                }, {
                    foo: null
                })).to.deep.equal({
                    foo: {
                        foo: 'foo'
                    }
                });
            });
            it('should merge 2 objects', function() {
                expect(_.defaultsDeep({
                    foo: {
                        foo: 'foo'
                    }
                }, {
                    foo: {
                        bar: 'bar'
                    }
                })).to.deep.equal({
                    foo: {
                        foo: 'foo',
                        bar: 'bar'
                    }
                });
            });
        });
        describe('.isEmpty()', function() {
            it('should return true for empty array', function() {
                expect(_.isEmpty([])).to.equal(true);
            });
            it('should return true for empty string', function() {
                expect(_.isEmpty('')).to.equal(true);
            });
        });
        describe('.split()', function() {
            it('should support string separator', function() {
                expect(_.split('abcb', 'b')).to.deep.equal(['a', 'c', '']);
            });
            it('should support RegExp separator', function() {
                expect(_.split('abcb', /b/)).to.deep.equal(['a', 'c', '']);
            });
        });
        describe('.partialRight()', function() {
            it('should support zero partials', function() {
                var g = _.partialRight(func);
                expect(g('a', 'b', 'c')).to.equal('abc');
            });
            it('should support one partials', function() {
                var g = _.partialRight(func, 'c');
                expect(g('a', 'b')).to.equal('abc');
            });
            it('should support two partials', function() {
                var g = _.partialRight(func, 'b', 'c');
                expect(g('a')).to.equal('abc');
            });
        });
        describe('.format()', function() {
            it('should support multiple args', function() {
                expect(_.format('foo%sbar%s', 'a', 'b')).to.equal('fooabarb');
            });
            it('should support plain string', function() {
                expect(_.format('foo%sbar%s')).to.equal('foo%sbar%s');
            });
        });
    });
});
