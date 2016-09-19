/**
 * @file fragment spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Fragment = require('router/uri/component/Fragment');

    describe('router/uri/component/Fragment', function () {

        describe('#toString()', function () {

            it('should return empty string when had not data', function () {
                var fragment = new Fragment();
                expect(fragment.toString()).to.deep.equal('');
            });

            it('should add prefix when had data', function () {
                var fragment = new Fragment('target');
                expect(fragment.toString()).to.deep.equal('#target');
            });

            it('should add custom prefix when had data', function () {
                var fragment = new Fragment('target');
                expect(fragment.toString('~')).to.deep.equal('~target');
            });

        });

    });

});
