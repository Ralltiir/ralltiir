/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/router/uri/util/uri-parser.js
 */

define(['src/router/uri/util/uri-parser'], function(URIParser) {
    describe('router/uri/util/uri-parser', function() {
        var ret;
        before(function(){
            ret = URIParser('http://harttle:baidu@www.baidu.com:8008/home?foo=bar#body');
        });
        it('should parse scheme', function(){
            expect(ret.scheme).to.equal('http');
        });
        it('should parse username', function(){
            expect(ret.username).to.equal('harttle');
        });
        it('should parse password', function(){
            expect(ret.password).to.equal('baidu');
        });
        it('should parse path', function(){
            expect(ret.path).to.equal('/home');
        });
        it('should parse query', function(){
            expect(ret.query).to.equal('foo=bar');
        });
        it('should parse fragment', function(){
            expect(ret.fragment).to.equal('body');
        });
        it('should parse port', function(){
            expect(ret.port).to.equal('8008');
        });
        it('should parse host', function(){
            expect(ret.host).to.equal('www.baidu.com');
        });
    });
});
