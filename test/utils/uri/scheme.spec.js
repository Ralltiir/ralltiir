/**
 * @file scheme spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var Scheme = require('utils/uri/component/Scheme');

    describe('utils/uri/component/Scheme', function () {

        describe('set', function () {

            it('should not case sensitive', function () {
                var scheme = new Scheme();
                scheme.set('HTTP');
                expect(scheme.data).to.deep.equal('http');
            });

        });

        describe('equal', function () {
            it('should not case sensitive', function () {
                var scheme = new Scheme('http');

                expect(scheme.equal('http')).to.be.ok;
                expect(scheme.equal('HTTP')).to.be.ok;
            });

            it('should compare with Scheme object', function () {
                var schemeStr = 'http';
                var scheme1 = new Scheme(schemeStr);
                var scheme2 = new Scheme(schemeStr);
                var scheme3 = new Scheme();

                expect(scheme1.equal(scheme2)).to.be.ok;
                expect(scheme2.equal(scheme1)).to.be.ok;
                expect(scheme1.equal(scheme3)).to.not.be.ok;
                expect(scheme3.equal(scheme1)).to.not.be.ok;
            });
        });

    });

});
