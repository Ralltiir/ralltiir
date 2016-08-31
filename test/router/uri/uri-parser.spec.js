/**
 * @file uri-parser spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var parseURI = require('router/uri/util/uri-parser');

    describe('uri-parser', function () {

        describe('string param', function () {

            it('contains only host', function () {
                var str = 'www.baidu.com';
                var uri = parseURI(str);

                expect(uri.scheme).toBeUndefined();
                expect(uri.username).toBeUndefined();
                expect(uri.password).toBeUndefined();
                expect(uri.host).toEqual(str);
                expect(uri.port).toBeUndefined();
                expect(uri.path).toBeUndefined();
                expect(uri.query).toBeUndefined();
                expect(uri.fragment).toBeUndefined();
            });

            it('contains scheme, host, port, and path', function () {
                var str = 'https://www.baidu.com:8080/search/abc/wdf';
                var uri = parseURI(str);

                expect(uri.scheme).toEqual('https');
                expect(uri.username).toBeUndefined();
                expect(uri.password).toBeUndefined();
                expect(uri.host).toEqual('www.baidu.com');
                expect(uri.port).toEqual('8080');
                expect(uri.path).toEqual('/search/abc/wdf');
                expect(uri.query).toBeUndefined();
                expect(uri.fragment).toBeUndefined();
            });

            it('contains file scheme', function () {
                var str = 'file://usr/lib/share';
                var uri = parseURI(str);
                expect(uri.scheme).toEqual('file');
                expect(uri.username).toBeUndefined();
                expect(uri.password).toBeUndefined();
                expect(uri.host).toBeUndefined();
                expect(uri.port).toBeUndefined();
                expect(uri.path).toEqual('usr/lib/share');
                expect(uri.query).toBeUndefined();
                expect(uri.fragment).toBeUndefined();
            });

            it('contains host and port', function () {
                var str = 'www.baidu.com:8080';
                var uri = parseURI(str);

                expect(uri.scheme).toBeUndefined();
                expect(uri.username).toBeUndefined();
                expect(uri.password).toBeUndefined();
                expect(uri.host).toEqual('www.baidu.com');
                expect(uri.port).toEqual('8080');
                expect(uri.path).toBeUndefined();
                expect(uri.query).toBeUndefined();
                expect(uri.fragment).toBeUndefined();
            });

            it('contains host and path', function () {
                var str = 'www.baidu.com/abc/efg?q=123';
                var uri = parseURI(str);

                expect(uri.scheme).toBeUndefined();
                expect(uri.username).toBeUndefined();
                expect(uri.password).toBeUndefined();
                expect(uri.host).toEqual('www.baidu.com');
                expect(uri.port).toBeUndefined();
                expect(uri.path).toEqual('/abc/efg');
                expect(uri.query).toEqual('q=123');
                expect(uri.fragment).toBeUndefined();
            });

            it('contains host, port, path, query and fragment', function () {
                var str = 'www.baidu.com:8080/search?wd=w#notarget';
                var uri = parseURI(str);

                expect(uri.scheme).toBeUndefined();
                expect(uri.username).toBeUndefined();
                expect(uri.password).toBeUndefined();
                expect(uri.host).toEqual('www.baidu.com');
                expect(uri.port).toEqual('8080');
                expect(uri.path).toEqual('/search');
                expect(uri.query).toEqual('wd=w');
                expect(uri.fragment).toEqual('notarget');
            });

            it('contains scheme, path', function () {
                var str = 'mailto:c.xinle@gmail.com';
                var uri = parseURI(str);

                expect(uri.scheme).toEqual('mailto');
                expect(uri.username).toBeUndefined();
                expect(uri.password).toBeUndefined();
                expect(uri.host).toBeUndefined();
                expect(uri.port).toBeUndefined();
                expect(uri.path).toEqual('c.xinle@gmail.com');
                expect(uri.query).toBeUndefined();
                expect(uri.fragment).toBeUndefined();
            });

            it('contains scheme and path, part 2', function () {
                var str = 'nun:www@www.baidu.com/search/abc/ddd';
                var uri = parseURI(str);

                expect(uri.scheme).toEqual('nun');
                expect(uri.username).toBeUndefined();
                expect(uri.password).toBeUndefined();
                expect(uri.host).toBeUndefined();
                expect(uri.port).toBeUndefined();
                expect(uri.path).toEqual('www@www.baidu.com/search/abc/ddd');
                expect(uri.query).toBeUndefined();
                expect(uri.fragment).toBeUndefined();
            });

        });

    });

});
