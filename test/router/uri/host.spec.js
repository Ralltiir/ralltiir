/**
 * @file host spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var Host = require('router/uri/component/Host');

    describe('router/uri/componet/Host', function () {

        describe('#set()', function () {

            it('should not case sensitive', function () {
                var host = new Host();
                host.set('www.Baidu.com');
                expect(host.data).to.deep.equal('www.baidu.com');
            });

        });

        describe('#equal()', function () {
            it('should not case sensitive', function () {
                var host = new Host('www.baidu.com');

                expect(host.equal('www.baidu.com')).to.be.ok;
                expect(host.equal('WWW.BAIDU.COM')).to.be.ok;
            });

            it('should compare with Host object', function () {
                var hostStr = 'www.baidu.com';
                var host1 = new Host(hostStr);
                var host2 = new Host(hostStr);
                var host3 = new Host();

                expect(host1.equal(host2)).to.be.ok;
                expect(host2.equal(host1)).to.be.ok;
                expect(host1.equal(host3)).to.not.be.ok;
                expect(host3.equal(host1)).to.not.be.ok;
            });
        });

    });

});

