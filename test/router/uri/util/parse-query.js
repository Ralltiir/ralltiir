/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/router/uri/util/parse-query.js
 */

define(['src/router/uri/util/parse-query'], function(PQ) {
    describe('router/uri/util/parse-query', function() {
        it('should handle simple query', function(){
            expect(PQ('foo=bar')).to.deep.equal({foo: 'bar'});
        });
        it('should handle Array type property', function(){
            expect(PQ('foo=foo&foo=bar')).to.deep.equal({foo: ['foo','bar']});
        });
        it('should handle multiple properties', function(){
            expect(PQ('foo=foo&bar=bar')).to.deep.equal({foo: 'foo', bar: 'bar'});
        });
        it('should handle empty object', function(){
            expect(PQ('')).to.deep.equal({});
        });
        it('should handle undefined object', function(){
            expect(PQ('')).to.deep.equal({});
        });
    });
});
