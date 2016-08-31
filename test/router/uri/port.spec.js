/**
 * @file port spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Port = require('router/uri/component/Port');

    describe('Port', function () {

        describe('equal', function () {

            it('should case default port', function () {
                var port = new Port('443');
                expect(port.equal('', 'https')).toBeTruthy();
                expect(port.equal('')).toBeFalsy();
            });

            it('should compare with Port object', function () {
                var port1 = new Port('443');
                var port2 = new Port();

                expect(port1.equal(port2)).toBeFalsy();
                expect(port2.equal(port1)).toBeFalsy();
                expect(port1.equal(port2, 'https')).toBeTruthy();
                expect(port2.equal(port1, 'https')).toBeTruthy();
            });

        });

        describe('toString', function () {
            it('should return empty string when had not data', function () {
                var port = new Port();
                expect(port.toString()).toEqual('');
            });
            it('should add prefix when had data', function () {
                var port = new Port('443');
                expect(port.toString()).toEqual(':443');
            });
        });

    });

});
