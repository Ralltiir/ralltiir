/**
 * @file path spec
 * @author treelite(c.xinle@gmail.com)
 */

/* eslint-env mocha */

/* eslint max-nested-callbacks: ["error", 6] */

/* globals sinon: true */

define(function (require) {

    var Path = require('utils/uri/component/Path');

    describe('utils/uri/component/path', function () {

        describe('.resolve()', function () {

            it('should handle one arguments', function () {
                expect(Path.resolve('abc/../abd/../../abd/ccc')).to.deep.equal('../abd/ccc');
                expect(Path.resolve('/abc/../abd/../../abd/ccc')).to.deep.equal('/abd/ccc');
            });

            it('should handle two arguments', function () {
                expect(Path.resolve('abc', '../abde')).to.deep.equal('../abde');
                expect(Path.resolve('/abc/../abd', '../../abd/ccc')).to.deep.equal('/abd/ccc');
                expect(Path.resolve('/abc/abd', '../ccc')).to.deep.equal('/ccc');
                expect(Path.resolve('/abc/abd', './ccc')).to.deep.equal('/abc/ccc');
                expect(Path.resolve('/abc/abd', '../')).to.deep.equal('/');
            });

            it('should not ignore the last slash', function () {
                expect(Path.resolve('/abcd/../abc/')).to.deep.equal('/abc/');
                expect(Path.resolve('/')).to.deep.equal('/');

                expect(Path.resolve('/abc/abd/', './ccc')).to.deep.equal('/abc/abd/ccc');
                expect(Path.resolve('/abc/abd/', './ccc/')).to.deep.equal('/abc/abd/ccc/');
            });

            it('should ignore first argument when second argument start with "/"', function () {
                expect(Path.resolve('/abc/abd', '/../abc/../')).to.deep.equal('/');
                expect(Path.resolve('/abc/abd', '//abc')).to.deep.equal('/abc');
            });

            it('out of range', function () {
                expect(Path.resolve('/', '../../b')).to.deep.equal('/b');
                expect(Path.resolve('../../b')).to.deep.equal('../../b');
            });

            it('wrong path', function () {
                expect(Path.resolve('///abc')).to.deep.equal('/abc');
                expect(Path.resolve('///../abc')).to.deep.equal('/abc');
            });

        });

        describe('new', function () {

            it('with argument should pass', function () {
                var path = new Path('abc/dd');
                expect(path.data).to.deep.equal('abc/dd');
            });

            it('without argument will be empty', function () {
                var path = new Path();
                expect(path.data).to.deep.equal('');
            });

            it('with base path string', function () {
                var path = new Path('../abc', 'foo/bar/hello');
                expect(path.data).to.deep.equal('foo/abc');
            });

            it('with base Path object', function () {
                var base = new Path('foo/bar/hello');
                var path = new Path('../abc', base);
                expect(path.data).to.deep.equal('foo/abc');
            });
        });

        describe('#set()', function () {

            it('should pass', function () {
                var path = new Path('abc');
                path.set('ddd/abc');
                expect(path.data).to.deep.equal('ddd/abc');
            });

            it('should resolve argument', function () {
                var path = new Path('abc');
                path.set('ddd/../bde/../abc');
                expect(path.data).to.deep.equal('abc');
            });

            it('without argument will be empty', function () {
                var path = new Path('abc');
                path.set();
                expect(path.data).to.deep.equal('');
            });

            it('should resolved with base path string', function () {
                var path = new Path();

                path.set('../abc', 'foo/bar/hello');
                expect(path.data).to.deep.equal('foo/abc');
            });

            it('should resolved with base Path object', function () {
                var path = new Path();
                var base = new Path('foo/bar/hello');


                path.set('../abc', base);
                expect(path.data).to.deep.equal('foo/abc');
            });

        });

        describe('#equal()', function () {

            it('should return true when they are same', function () {
                var path = new Path('abc/dd');
                expect(path.equal('abc/dd')).to.be.ok;
                expect(path.equal('abc/bded/../dd')).to.be.ok;
            });

            it('should return false when they are not same', function () {
                var path = new Path('abc/dd');
                expect(path.equal('abc/dd/bb')).to.not.be.ok;
                expect(path.equal('abc/../dd')).to.not.be.ok;
                expect(path.equal('abc/dd/')).to.not.be.ok;
            });

            it('should return true betwen empty string and \'/\'', function () {
                var path = new Path('/');
                expect(path.equal('')).to.be.ok;
            });

            it('should compare with Path object', function () {
                var path1 = new Path('/abc/edf');
                var path2 = new Path('/abc/edf');
                var path3 = new Path();

                expect(path1.equal(path2)).to.be.ok;
                expect(path2.equal(path1)).to.be.ok;
                expect(path1.equal(path3)).to.not.be.ok;
                expect(path3.equal(path1)).to.not.be.ok;
            });

        });

        describe('#toString()', function () {

            it('should return the right string', function () {
                var path = new Path('../ab/cc');
                expect(path.toString()).to.deep.equal('../ab/cc');
            });

        });

        describe('#resolve()', function () {

            it('should resolved string', function () {
                var path = new Path('abc/foo/bar.html');
                path.resolve('../hello.html');
                expect(path.data).to.deep.equal('abc/hello.html');
            });

            it('should resolved Path object', function () {
                var path = new Path('abc/foo/bar');
                var path2 = new Path('../hello');

                path.resolve(path2);
                expect(path.data).to.deep.equal('abc/hello');
            });

            it('should resolved from path', function () {
                var path = new Path('../hello');

                path.resolve('abc/foo/bar', true);
                expect(path.data).to.deep.equal('abc/hello');
            });

        });

    });

});
