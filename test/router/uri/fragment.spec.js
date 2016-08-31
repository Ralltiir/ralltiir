/**
 * @file fragment spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Fragment = require('router/uri/component/Fragment');

    describe('Fragment', function () {

        describe('toString', function () {

            it('should return empty string when had not data', function () {
                var fragment = new Fragment();
                expect(fragment.toString()).toEqual('');
            });

            it('should add prefix when had data', function () {
                var fragment = new Fragment('target');
                expect(fragment.toString()).toEqual('#target');
            });

            it('should add custom prefix when had data', function () {
                var fragment = new Fragment('target');
                expect(fragment.toString('~')).toEqual('~target');
            });

        });

    });

});
