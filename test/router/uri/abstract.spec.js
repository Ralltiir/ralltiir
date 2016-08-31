/**
 * @file abstract spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Abstract = require('router/uri/component/Abstract');

    describe('Abstract', function () {

        it('should have many base methods', function () {
            var absObj = new Abstract();
            expect(typeof absObj.set).toEqual('function');
            expect(typeof absObj.get).toEqual('function');
            expect(typeof absObj.add).toEqual('function');
            expect(typeof absObj.remove).toEqual('function');
            expect(typeof absObj.toString).toEqual('function');
            expect(typeof absObj.equal).toEqual('function');
        });

        it('set should pass', function () {
            var absObj = new Abstract();
            absObj.set('hello');
            expect(absObj.data).toEqual('hello');
        });

        it('set undefined should equal empty string', function () {
            var absObj = new Abstract();
            absObj.set();
            expect(absObj.data).toEqual('');
        });

        it('get should return data', function () {
            var absObj = new Abstract('hello');
            expect(absObj.get()).toEqual('hello');

        });

        it('add should equal set', function () {
            var absObj = new Abstract();
            absObj.add('hello')
            expect(absObj.data).toEqual('hello');

        });

        it('remove should set data to empty string', function () {
            var absObj = new Abstract('hello');
            absObj.remove();
            expect(absObj.data).toEqual('');
        });

        it('toString should return string', function () {
            var absObj = new Abstract(123);
            expect(absObj.toString()).toBe('123');
        });

        it('equal should return true when they are same', function () {
            var absObj = new Abstract(123);
            expect(absObj.equal('123')).toBeTruthy();
        });

        it('equal should return false when they are not same', function () {
            var absObj = new Abstract();
            expect(absObj.equal('123')).toBeFalsy();
        });

    });

});
