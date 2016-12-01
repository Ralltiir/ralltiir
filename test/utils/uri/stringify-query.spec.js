/**
 * @file stringify-query spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var stringify = require('utils/uri/util/stringify-query');

    describe('utils/uri/util/stringify-query', function () {

        it('with noraml item', function () {
            var query = {name: 'cxl', age: 10};

            query = stringify(query);
            expect(query).to.deep.equal('name=cxl&age=10');
        });

        it('with array item', function () {
            var query = {name: ['cxl', 'treelite'], age: 10};

            query = stringify(query);
            expect(query).to.deep.equal('name=cxl&name=treelite&age=10');
        });

        it('with null and undefined item', function () {
            var query = {name: null, age: undefined};

            query = stringify(query);
            expect(query).to.deep.equal('name&age=');
        });

        it('decode check', function () {
            var query = {company: ['百度', '淘宝'], address: '北京'};

            query = stringify(query);
            expect(query).to.deep.equal(
                'company='
                + encodeURIComponent('百度')
                + '&company='
                + encodeURIComponent('淘宝')
                + '&address='
                + encodeURIComponent('北京')
            );
        });

    });

});
