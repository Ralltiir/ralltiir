/**
 * @file path spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Path = require('router/uri/component/Path');

    describe('Path', function () {

        describe('static resolve', function () {

            it('should handle one arguments', function () {
                expect(Path.resolve('abc/../abd/../../abd/ccc')).toEqual('../abd/ccc');
                expect(Path.resolve('/abc/../abd/../../abd/ccc')).toEqual('/abd/ccc');
            });

            it('should handle two arguments', function () {
                expect(Path.resolve('abc', '../abde')).toEqual('../abde');
                expect(Path.resolve('/abc/../abd', '../../abd/ccc')).toEqual('/abd/ccc');
                expect(Path.resolve('/abc/abd', '../ccc')).toEqual('/ccc');
                expect(Path.resolve('/abc/abd', './ccc')).toEqual('/abc/ccc');
                expect(Path.resolve('/abc/abd', '../')).toEqual('/');
            });

            it('should not ignore the last slash', function () {
                expect(Path.resolve('/abcd/../abc/')).toEqual('/abc/');
                expect(Path.resolve('/')).toEqual('/');

                expect(Path.resolve('/abc/abd/', './ccc')).toEqual('/abc/abd/ccc');
                expect(Path.resolve('/abc/abd/', './ccc/')).toEqual('/abc/abd/ccc/');
            });

            it('should ignore first argument when second argument start with "/"', function () {
                expect(Path.resolve('/abc/abd', '/../abc/../')).toEqual('/');
                expect(Path.resolve('/abc/abd', '//abc')).toEqual('/abc');
            });

            it('out of range', function () {
                expect(Path.resolve('/', '../../b')).toEqual('/b');
                expect(Path.resolve('../../b')).toEqual('../../b');
            });

            it('wrong path', function () {
                expect(Path.resolve('///abc')).toEqual('/abc');
                expect(Path.resolve('///../abc')).toEqual('/abc');
            });

        });

        describe('new', function () {

            it('with argument should pass', function () {
                var path = new Path('abc/dd');
                expect(path.data).toEqual('abc/dd');
            });

            it('without argument will be empty', function () {
                var path = new Path();
                expect(path.data).toEqual('');
            });

            it('with base path string', function () {
                var path = new Path('../abc', 'foo/bar/hello');
                expect(path.data).toEqual('foo/abc');
            });

            it('with base Path object', function () {
                var base = new Path('foo/bar/hello');
                var path = new Path('../abc', base);
                expect(path.data).toEqual('foo/abc');
            });
        });

        describe('set', function () {

            it('should pass', function () {
                var path = new Path('abc');
                path.set('ddd/abc');
                expect(path.data).toEqual('ddd/abc');
            });

            it('should resolve argument', function () {
                var path = new Path('abc');
                path.set('ddd/../bde/../abc');
                expect(path.data).toEqual('abc');
            });

            it('without argument will be empty', function () {
                var path = new Path('abc');
                path.set();
                expect(path.data).toEqual('');
            });

            it('should resolved with base path string', function () {
                var path = new Path();

                path.set('../abc', 'foo/bar/hello');
                expect(path.data).toEqual('foo/abc');
            });

            it('should resolved with base Path object', function () {
                var path = new Path();
                var base = new Path('foo/bar/hello');


                path.set('../abc', base);
                expect(path.data).toEqual('foo/abc');
            });

        });

        describe('equal', function () {

            it('should return true when they are same', function () {
                var path = new Path('abc/dd');
                expect(path.equal('abc/dd')).toBeTruthy();
                expect(path.equal('abc/bded/../dd')).toBeTruthy();
            });

            it('should return false when they are not same', function () {
                var path = new Path('abc/dd');
                expect(path.equal('abc/dd/bb')).toBeFalsy();
                expect(path.equal('abc/../dd')).toBeFalsy();
                expect(path.equal('abc/dd/')).toBeFalsy();
            });

            it('should return true betwen empty string and \'/\'', function () {
                var path = new Path('/');
                expect(path.equal('')).toBeTruthy();
            });

            it('should compare with Path object', function () {
                var path1 = new Path('/abc/edf');
                var path2 = new Path('/abc/edf');
                var path3 = new Path();

                expect(path1.equal(path2)).toBeTruthy();
                expect(path2.equal(path1)).toBeTruthy();
                expect(path1.equal(path3)).toBeFalsy();
                expect(path3.equal(path1)).toBeFalsy();
            });

        });

        describe('toString', function () {

            it('should return the right string', function () {
                var path = new Path('../ab/cc');
                expect(path.toString()).toEqual('../ab/cc');
            });

        });

        describe('resolve', function () {

            it('should resolved string', function () {
                var path = new Path('abc/foo/bar.html');
                path.resolve('../hello.html');
                expect(path.data).toEqual('abc/hello.html');
            });

            it('should resolved Path object', function () {
                var path = new Path('abc/foo/bar');
                var path2 = new Path('../hello');

                path.resolve(path2);
                expect(path.data).toEqual('abc/hello');
            });

            it('should resolved from path', function () {
                var path = new Path('../hello');

                path.resolve('abc/foo/bar', true);
                expect(path.data).toEqual('abc/hello');
            });

        });

    });

});
