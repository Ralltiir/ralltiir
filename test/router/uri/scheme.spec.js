/**
 * @file scheme spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var Scheme = require('router/uri/component/Scheme');

    describe('Scheme', function () {

        describe('set', function () {

            it('should not case sensitive', function () {
                var scheme = new Scheme();
                scheme.set('HTTP');
                expect(scheme.data).toEqual('http');
            });

        });

        describe('equal', function () {
            it('should not case sensitive', function () {
                var scheme = new Scheme('http');

                expect(scheme.equal('http')).toBeTruthy();
                expect(scheme.equal('HTTP')).toBeTruthy();
            });

            it('should compare with Scheme object', function () {
                var schemeStr = 'http';
                var scheme1 = new Scheme(schemeStr);
                var scheme2 = new Scheme(schemeStr);
                var scheme3 = new Scheme();

                expect(scheme1.equal(scheme2)).toBeTruthy();
                expect(scheme2.equal(scheme1)).toBeTruthy();
                expect(scheme1.equal(scheme3)).toBeFalsy();
                expect(scheme3.equal(scheme1)).toBeFalsy();
            });
        });

    });

});
