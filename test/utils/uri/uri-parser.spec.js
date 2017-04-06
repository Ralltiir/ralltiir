/**
 * @file uri-parser spec
 * @author treelite(c.xinle@gmail.com)
 */

/* eslint-env mocha */

/* eslint max-nested-callbacks: ["error", 6] */

/* globals sinon: true */

define(function (require) {

    var parseURI = require('utils/uri/util/uri-parser');

    describe('utils/uri/util/uri-parser', function () {

        describe('string param', function () {

            it('contains only host', function () {
                var str = 'www.baidu.com';
                var uri = parseURI(str);

                expect(uri.scheme).to.be.undefined;
                expect(uri.username).to.be.undefined;
                expect(uri.password).to.be.undefined;
                expect(uri.host).to.deep.equal(str);
                expect(uri.port).to.be.undefined;
                expect(uri.path).to.be.undefined;
                expect(uri.query).to.be.undefined;
                expect(uri.fragment).to.be.undefined;
            });

            it('contains scheme, host, port, and path', function () {
                var str = 'https://www.baidu.com:8080/search/abc/wdf';
                var uri = parseURI(str);

                expect(uri.scheme).to.deep.equal('https');
                expect(uri.username).to.be.undefined;
                expect(uri.password).to.be.undefined;
                expect(uri.host).to.deep.equal('www.baidu.com');
                expect(uri.port).to.deep.equal('8080');
                expect(uri.path).to.deep.equal('/search/abc/wdf');
                expect(uri.query).to.be.undefined;
                expect(uri.fragment).to.be.undefined;
            });

            it('contains file scheme', function () {
                var str = 'file://usr/lib/share';
                var uri = parseURI(str);
                expect(uri.scheme).to.deep.equal('file');
                expect(uri.username).to.be.undefined;
                expect(uri.password).to.be.undefined;
                expect(uri.host).to.be.undefined;
                expect(uri.port).to.be.undefined;
                expect(uri.path).to.deep.equal('usr/lib/share');
                expect(uri.query).to.be.undefined;
                expect(uri.fragment).to.be.undefined;
            });

            it('contains host and port', function () {
                var str = 'www.baidu.com:8080';
                var uri = parseURI(str);

                expect(uri.scheme).to.be.undefined;
                expect(uri.username).to.be.undefined;
                expect(uri.password).to.be.undefined;
                expect(uri.host).to.deep.equal('www.baidu.com');
                expect(uri.port).to.deep.equal('8080');
                expect(uri.path).to.be.undefined;
                expect(uri.query).to.be.undefined;
                expect(uri.fragment).to.be.undefined;
            });

            it('contains host and path', function () {
                var str = 'www.baidu.com/abc/efg?q=123';
                var uri = parseURI(str);

                expect(uri.scheme).to.be.undefined;
                expect(uri.username).to.be.undefined;
                expect(uri.password).to.be.undefined;
                expect(uri.host).to.deep.equal('www.baidu.com');
                expect(uri.port).to.be.undefined;
                expect(uri.path).to.deep.equal('/abc/efg');
                expect(uri.query).to.deep.equal('q=123');
                expect(uri.fragment).to.be.undefined;
            });

            it('contains host, port, path, query and fragment', function () {
                var str = 'www.baidu.com:8080/search?wd=w#notarget';
                var uri = parseURI(str);

                expect(uri.scheme).to.be.undefined;
                expect(uri.username).to.be.undefined;
                expect(uri.password).to.be.undefined;
                expect(uri.host).to.deep.equal('www.baidu.com');
                expect(uri.port).to.deep.equal('8080');
                expect(uri.path).to.deep.equal('/search');
                expect(uri.query).to.deep.equal('wd=w');
                expect(uri.fragment).to.deep.equal('notarget');
            });

            it('contains scheme, path', function () {
                var str = 'mailto:c.xinle@gmail.com';
                var uri = parseURI(str);

                expect(uri.scheme).to.deep.equal('mailto');
                expect(uri.username).to.be.undefined;
                expect(uri.password).to.be.undefined;
                expect(uri.host).to.be.undefined;
                expect(uri.port).to.be.undefined;
                expect(uri.path).to.deep.equal('c.xinle@gmail.com');
                expect(uri.query).to.be.undefined;
                expect(uri.fragment).to.be.undefined;
            });

            it('contains scheme and path, part 2', function () {
                var str = 'nun:www@www.baidu.com/search/abc/ddd';
                var uri = parseURI(str);

                expect(uri.scheme).to.deep.equal('nun');
                expect(uri.username).to.be.undefined;
                expect(uri.password).to.be.undefined;
                expect(uri.host).to.be.undefined;
                expect(uri.port).to.be.undefined;
                expect(uri.path).to.deep.equal('www@www.baidu.com/search/abc/ddd');
                expect(uri.query).to.be.undefined;
                expect(uri.fragment).to.be.undefined;
            });

        });

    });

});
