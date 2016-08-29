/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/router/uri/util/stringify-query.js
 */

define(['src/router/uri/util/stringify-query'], function(SQ) {
    describe('router/uri/util/stringify-query', function() {
        it('should handle simple query', function(){
            expect(SQ({foo: 'bar'})).to.equal('foo=bar');
        });
        it('should handle Array type property', function(){
            expect(SQ({foo: ['foo','bar']})).to.equal('foo=foo&foo=bar');
        });
        it('should handle multiple properties', function(){
            expect(SQ({foo: 'foo', bar: 'bar'})).to.equal('foo=foo&bar=bar');
        });
        it('should handle empty object', function(){
            expect(SQ({})).to.equal('');
        });
        it('should handle undefined object', function(){
            expect(SQ({})).to.equal('');
        });
    });
});
