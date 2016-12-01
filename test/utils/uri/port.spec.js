/**
 * @file port spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Port = require('utils/uri/component/Port');

    describe('utils/uri/component/port', function () {

        describe('#equal()', function () {

            it('should case default port', function () {
                var port = new Port('443');
                expect(port.equal('', 'https')).to.be.ok;
                expect(port.equal('')).to.not.be.ok;
            });

            it('should compare with Port object', function () {
                var port1 = new Port('443');
                var port2 = new Port();

                expect(port1.equal(port2)).to.not.be.ok;
                expect(port2.equal(port1)).to.not.be.ok;
                expect(port1.equal(port2, 'https')).to.be.ok;
                expect(port2.equal(port1, 'https')).to.be.ok;
            });

        });

        describe('#toString()', function () {
            it('should return empty string when had not data', function () {
                var port = new Port();
                expect(port.toString()).to.deep.equal('');
            });
            it('should add prefix when had data', function () {
                var port = new Port('443');
                expect(port.toString()).to.deep.equal(':443');
            });
        });

    });

});
