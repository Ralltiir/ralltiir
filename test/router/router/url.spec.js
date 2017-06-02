/**
 * @file url测试用例
 * @author treelite(c.xinle@gmail.com)
 */

/* eslint-env mocha */

/* eslint max-nested-callbacks: ["error", 6] */

/* globals sinon: true */

define(function (require) {

    var URL = require('router/router/URL');

    describe('router/router/URL', function () {

        describe('#constructor()', function () {

            it('should pass width a string param', function () {
                var url = new URL('/hospital/search?kw=xxx#www');

                expect(url.path.get()).to.deep.equal('/hospital/search');
                expect(url.query.equal('kw=xxx')).to.be.ok;
                expect(url.fragment.equal('www')).to.be.ok;
            });

            it('should pass width base param', function () {
                var base = new URL('/hospital/search?kw=xxx');
                var url = new URL('../?kw=xxx', {base: base});

                expect(url.path.get()).to.deep.equal('/');
                expect(url.query.equal('kw=xxx')).to.be.ok;
            });

            it('should pass with query', function () {
                var url = new URL('/index?kw=www&t=10', {query: {t: '20'}});

                expect(url.path.get()).to.deep.equal('/index');
                expect(url.query.equal('kw=www&t=10&t=20')).to.be.ok;
            });

            it('should pass width token', function () {
                var url = new URL('/index~kw=ww&t=10', {token: '~'});

                expect(url.path.get()).to.deep.equal('/index');
                expect(url.query.equal('kw=ww&t=10')).to.be.ok;
                expect(url.fragment.get()).to.deep.equal('');
            });

            it('path should be "/" with empty param', function () {
                var url = new URL();
                expect(url.path.get()).to.deep.equal('/');

                url = new URL('', {token: '~'});
                expect(url.path.get()).to.deep.equal('/');
            });

            it('with root', function () {
                var url = new URL('abc', {root: '/abc'});

                expect(url.path.get()).to.deep.equal('/abc');
                expect(url.root).to.deep.equal('/abc');

                url = new URL('/abc', {root: '/abc/'});

                expect(url.path.get()).to.deep.equal('/abc');
                expect(url.root).to.deep.equal('/abc');
            });

            it('relative path with root', function () {
                var url = new URL('../../abc', {root: '/abc'});
                expect(url.path.get()).to.deep.equal('/');
                expect(url.root).to.deep.equal('/abc');

                url = new URL('../abc/foo', {root: '/abc'});
                expect(url.path.get()).to.deep.equal('/foo');
                expect(url.root).to.deep.equal('/abc');

                url = new URL('./foo', {root: '/abc'});
                expect(url.path.get()).to.deep.equal('/foo');
                expect(url.root).to.deep.equal('/abc');

                url = new URL('../../foo', {root: '/abc'});
                expect(url.path.get()).to.deep.equal('../../foo');
                expect(url.root).to.deep.equal('/abc');
            });

        });

        describe('#toString()', function () {

            it('should return the right string', function () {
                var url = new URL('../work/search?kw=xxx');
                expect(url.toString()).to.deep.equal('/work/search?kw=xxx');

                url = new URL('/work/search/');
                expect(url.toString()).to.deep.equal('/work/search/');

                url = new URL('work/search?');
                expect(url.toString()).to.deep.equal('/work/search');

                url = new URL('work/search?www#');
                expect(url.toString()).to.deep.equal('/work/search?www');

                url = new URL('work/search?www#111');
                expect(url.toString()).to.deep.equal('/work/search?www#111');

                url = new URL();
                expect(url.toString()).to.deep.equal('/');
            });

            it('should return the right string with special token', function () {
                var url = new URL('../work/search~kw=xxx', {token: '~'});
                expect(url.toString()).to.deep.equal('/work/search~kw=xxx');

                url = new URL('work/search~', {token: '~'});
                expect(url.toString()).to.deep.equal('/work/search');
            });

            it('with root', function () {
                var url = new URL('abc', {root: '/abc'});
                expect(url.toString()).to.deep.equal('/abc/abc');

                url = new URL('/abc', {root: '/abc/'});
                expect(url.toString()).to.deep.equal('/abc/abc');
            });

            it('relative path with root', function () {
                var url = new URL('../../abc', {root: '/abc'});
                expect(url.toString()).to.deep.equal('/abc/');

                url = new URL('../abc/foo', {root: '/abc'});
                expect(url.toString()).to.deep.equal('/abc/foo');

                url = new URL('./foo', {root: '/abc'});
                expect(url.toString()).to.deep.equal('/abc/foo');

                url = new URL('../../foo', {root: '/abc'});
                expect(url.toString()).to.deep.equal('/foo');
            });

        });

        describe('#equal()', function () {

            it('shoud return boolean', function () {
                var url1 = new URL('../work/search?kw=xxx&t=10');
                var url2 = new URL('../work/search');

                expect(url1.equal(url2)).to.not.be.ok;
                expect(url2.equal(url1)).to.not.be.ok;
            });

            it('should ingore query order', function () {
                var url1 = new URL('../work/search?kw=xxx&t=10');
                var url2 = new URL('../work/search?t=10&kw=xxx');

                expect(url1.equal(url2)).to.be.ok;
                expect(url2.equal(url1)).to.be.ok;
            });

            it('should ingore fragment', function () {
                var url1 = new URL('../work/search?kw=xxx&t=10');
                var url2 = new URL('../work/search?kw=xxx&t=10#www');

                expect(url1.equal(url2)).to.be.ok;
                expect(url2.equal(url1)).to.be.ok;
            });

        });

        describe('#equalWithFragment()', function () {
            it('shoud return boolean', function () {
                var url1 = new URL('../work/search?kw=xxx&t=10');
                var url2 = new URL('../work/search?kw=xxx&t=10#www');
                var url3 = new URL('../work/search?kw=xxx&t=10#www');

                expect(url1.equalWithFragment(url2)).to.not.be.ok;
                expect(url2.equalWithFragment(url1)).to.not.be.ok;
                expect(url3.equalWithFragment(url2)).to.be.ok;
                expect(url2.equalWithFragment(url3)).to.be.ok;
            });
        });

        describe('#getQuery()', function () {

            it('should return query data', function () {
                var url = new URL('work?kw=' + encodeURIComponent('中文') + '&t=10&t=11');

                var query = url.getQuery(url);
                expect(Object.keys(query).length).to.equal(2);
                expect(query.kw).to.deep.equal('中文');
                expect(query.t).to.deep.equal(['10', '11']);
            });

            it('should return empty object when has no query', function () {
                var url = new URL('work');

                expect(url.getQuery()).to.deep.equal({});
            });

        });

        describe('#getPath()', function () {

            it('should return string', function () {
                var url = new URL('work/search');

                expect(url.getPath()).to.deep.equal('/work/search');
            });

        });

    });

});
