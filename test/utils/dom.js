/**
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/utils/dom.js
 */

/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */

define(['../src/utils/dom'], function (dom) {
    describe('utils/dom', function () {
        describe('.hasClass()', function () {
            it('should return false when className empty', function () {
                var el = {
                    className: ''
                };
                expect(dom.hasClass(el, 'foo-bar')).to.be.false;
            });
            it('should return false if not exist', function () {
                var el = {
                    className: 'foo bar'
                };
                expect(dom.hasClass(el, 'foo-bar')).to.be.false;
            });
            it('should return true for exactly that className', function () {
                var el = {
                    className: 'foo-bar'
                };
                expect(dom.hasClass(el, 'foo-bar')).to.be.true;
            });
            it('should return true if exist', function () {
                var el = {
                    className: 'foo foo-bar bar'
                };
                expect(dom.hasClass(el, 'foo-bar')).to.be.true;
            });
        });
        describe('.addClass()', function () {
            it('should add class for empty className', function () {
                var el = {
                    className: ''
                };
                dom.addClass(el, 'foo-bar');
                expect(el.className).to.equal('foo-bar');
            });
            it('should add class for to class list', function () {
                var el = {
                    className: 'foo bar'
                };
                dom.addClass(el, 'foo-bar');
                expect(el.className).to.equal('foo bar foo-bar');
            });
            it('should not add if already exist', function () {
                var el = {
                    className: 'foo foo-bar bar'
                };
                dom.addClass(el, 'foo-bar');
                expect(el.className).to.equal('foo foo-bar bar');
            });
        });
    });
});
