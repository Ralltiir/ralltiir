/*
 * @author yangjun14(yangjvn@126.com)
 * @file 测试src/utils/dom.js
 */

define(['../src/utils/dom'], function($) {
    describe('dom', function() {
        describe('.param()', function(){
            it('should do serialize', function(){
                expect($.param({foo: 'bar'})).to.equal('foo=bar');
            });
            it('should separate k-v pairs', function(){
                expect($.param({foo: 'bar',bar:2})).to.equal('foo=bar&bar=2');
            });
            it('should encode Unicode', function(){
                expect($.param({foo: ' '})).to.equal('foo=%20');
            });
        });
    });
});
