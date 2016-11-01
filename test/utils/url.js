/*
 * @author yangjun14(yangjvn@126.com)
 * @file 测试src/utils/url.js
 */

define(['../src/utils/url'], function(url) {
    describe('url', function() {
        describe('.param()', function(){
            it('should do serialize', function(){
                expect(url.param({foo: 'bar'})).to.equal('foo=bar');
            });
            it('should separate k-v pairs', function(){
                expect(url.param({foo: 'bar',bar:2})).to.equal('foo=bar&bar=2');
            });
            it('should encode Unicode', function(){
                expect(url.param({foo: ' '})).to.equal('foo=%20');
            });
        });
    });
});
