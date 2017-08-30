/**
 * @author yangjun14(yangjvn@126.com)
 * @file 测试src/utils/url.js
 */

/* eslint-env mocha */

/* eslint-disable max-nested-callbacks */

/* globals sinon: true */

define(['utils/url'], function (url) {
    describe('utils/url', function () {

        describe('.param()', function () {
            it('should do serialize', function () {
                expect(url.param({
                    foo: 'bar'
                })).to.equal('foo=bar');
            });
            it('should separate k-v pairs', function () {
                expect(url.param({foo: 'bar', bar: 2})).to.equal('foo=bar&bar=2');
            });
            it('should encode Unicode', function () {
                expect(url.param({
                    foo: ' '
                })).to.equal('foo=%20');
            });
        });

        describe('#toString()', function () {

            it('should return the right string', function () {
                var str = 'www.baidu.com';
                expect(url(str).toString()).to.deep.equal(str);

                str = 'http://www.baidu.com/search?wd=hello';
                expect(url(str).toString()).to.deep.equal(str);

                str = 'www.baidu.com/?search=wd';
                expect(url(str).toString()).to.deep.equal(str);
            });

        });

        describe('#get()', function () {
            it('should return component data', function () {
                var l = url('www.baidu.com/search');

                expect(l.get('scheme')).to.equal('');
                expect(l.get('username')).to.equal('');
                expect(l.get('password')).to.equal('');
                expect(l.get('host')).to.deep.equal('www.baidu.com');
                expect(l.get('port')).to.equal('');
                expect(l.get('path')).to.deep.equal('/search');
                expect(l.get('query')).to.deep.equal({});
                expect(l.get('fragment')).to.equal('');
            });

            it('should return query data', function () {
                var l = url('www.baidu.com/search?wd=hello&page=10');

                expect(l.get('query', 'wd')).to.deep.equal('hello');
                expect(l.get('query', 'page')).to.deep.equal('10');
            });
        });

        describe('#set()', function () {
            it('without argument should pass', function () {
                var l = url('www.baidu.com');
                var str = 'www.google.com/?query=wd';

                l.set(str);

                expect(l.toString()).to.deep.equal(str);
                expect(l.path.toString()).to.deep.equal('/');
                expect(l.query.toString()).to.deep.equal('?query=wd');
            });
        });

        describe('#equal()', function () {
            it('width string should return true when they are the same', function () {
                expect(url('www.baidu.com?wd=hello#no').equal('www.baidu.com?wd=hello#no')).to.be.ok;
            });

            it('with string should return fase when they are not the same', function () {
                expect(url('www.baidu.com?wd=hello#no').equal('www.baidu.com')).to.not.be.ok;
            });

            it('width URI object should return true when they are the same', function () {
                var aURI = url('www.baidu.com?wd=hello#no');
                var bURI = url('www.baidu.com?wd=hello#no');
                expect(aURI.equal(bURI)).to.be.ok;
            });

            it('with URI object should return fase when they are not the same', function () {
                var aURI = url('www.baidu.com?wd=hello#no');
                var bURI = url('www.baidu.com');
                expect(aURI.equal(bURI)).to.not.be.ok;
            });

            it('should not case sensitive about host', function () {
                expect(url('www.BAIDU.COM').equal('www.baidu.com')).to.be.ok;
            });

            it('should not case sensitive about scheme', function () {
                expect(url('HTTps://www.baidu.com').equal('https://www.baidu.com')).to.be.ok;
            });

            it('should case default port', function () {
                expect(url('https://www.baidu.com').equal('https://www.baidu.com:443')).to.be.ok;
            });

            it('should normalize path', function () {
                expect(url('https://www.baidu.com').equal('https://www.baidu.com/')).to.be.ok;
                expect(url('https://www.baidu.com?xxx').equal('https://www.baidu.com/?xxx')).to.be.ok;
            });
        });

    });

});
