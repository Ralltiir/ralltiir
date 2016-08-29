/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/router/uri/uri.js
 */

define(['src/router/uri/URI', 'src/router/uri/component/Scheme'], function(URI, Scheme) {
    describe('router/uri/uri', function() {
        var uri;
        beforeEach(function(){
            uri = new URI('http://www.baidu.com');
            sinon.spy(Scheme.prototype, 'set');
            sinon.spy(Scheme.prototype, 'get');
        });
        afterEach(function(){
            Scheme.prototype.set.restore();
            Scheme.prototype.get.restore();
        });
        it('should set component data', function() {
            uri.set('scheme', 'foo', 'bar');
            expect(Scheme.prototype.set).to.have.been.calledWith('foo', 'bar');
        });
        it('should set all component data when not specified', function() {
            uri.set('', 'http://www.google.com.hk?bar=foo#foo');
            expect(Scheme.prototype.set).to.have.been.called;
        });
        it('should call get component data', function(){
            uri.get('scheme', 'foo', 'bar');
            expect(Scheme.prototype.get).to.have.been.calledWith('foo', 'bar');
        });
        it('should support toString', function(){
            expect(uri.toString()).to.equal('http://www.baidu.com');
        });
        it('should support component toString', function(){
            expect(uri.toString('scheme')).to.equal('http');
        });
        it('should support equal', function(){
            expect(uri.equal(new URI('http://www.baidu.com'))).to.be.true;
            expect(uri.equal(new URI('http://www.google.com'))).to.be.false;
        });
    });
});
