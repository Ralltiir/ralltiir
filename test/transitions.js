/**
* @file
* @author harttle<yanjun14@baidu.com>
*/

/* eslint-env mocha */
/* globals sinon: true */

define(function (require) {
    var transitions = require('transitions');
    var _ = require('@searchfe/underscore');

    describe.only('transitions', function () {
        beforeEach(function () {
            transitions.clear();
        });
        it('should return undefined when if registered', function () {
            expect(transitions.getImpl('foo', 'bar')).to.equal(undefined);
        });
        it('should find registered according to from/to', function () {
            var options1 = {
                from: 'bar',
                to: 'bar',
                impl: function () {}
            };
            var options2 = {
                from: 'foo',
                to: 'bar',
                impl: function () {}
            };
            transitions.register(options1);
            transitions.register(options2);
            expect(transitions.getImpl('foo', 'bar')).to.equal(options2.impl);
        });
        it('should default impl to _.noop', function () {
            var options = {from: 'foo', to: 'bar'};
            transitions.register(options);
            var impl = transitions.getImpl('foo', 'bar');
            expect(impl).to.equal(_.noop);
        });
    });
});
