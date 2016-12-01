/**
 * @file abstract spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Abstract = require('utils/uri/component/Abstract');

    describe('utils/uri/component/Abstract', function () {

        it('should have many base methods', function () {
            var absObj = new Abstract();
            expect(typeof absObj.set).to.deep.equal('function');
            expect(typeof absObj.get).to.deep.equal('function');
            expect(typeof absObj.add).to.deep.equal('function');
            expect(typeof absObj.remove).to.deep.equal('function');
            expect(typeof absObj.toString).to.deep.equal('function');
            expect(typeof absObj.equal).to.deep.equal('function');
        });

        it('set should pass', function () {
            var absObj = new Abstract();
            absObj.set('hello');
            expect(absObj.data).to.deep.equal('hello');
        });

        it('set undefined should equal empty string', function () {
            var absObj = new Abstract();
            absObj.set();
            expect(absObj.data).to.deep.equal('');
        });

        it('get should return data', function () {
            var absObj = new Abstract('hello');
            expect(absObj.get()).to.deep.equal('hello');

        });

        it('add should equal set', function () {
            var absObj = new Abstract();
            absObj.add('hello');
            expect(absObj.data).to.deep.equal('hello');

        });

        it('remove should set data to empty string', function () {
            var absObj = new Abstract('hello');
            absObj.remove();
            expect(absObj.data).to.deep.equal('');
        });

        it('toString should return string', function () {
            var absObj = new Abstract(123);
            expect(absObj.toString()).to.equal('123');
        });

        it('equal should return true when they are same', function () {
            var absObj = new Abstract(123);
            expect(absObj.equal('123')).to.be.ok;
        });

        it('equal should return false when they are not same', function () {
            var absObj = new Abstract();
            expect(absObj.equal('123')).to.not.be.ok;
        });

    });

});
