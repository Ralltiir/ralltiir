/**
 * @file parse-query spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var parse = require('utils/uri/util/parse-query');

    describe('utils/uri/util/parse-query', function () {

        it('with empty string', function () {
            var query = '';

            query = parse(query);
            expect(Object.keys(query).length).to.equal(0);
        });

        it('with noraml string', function () {
            var query = 'name=treelite&age=10';

            query = parse(query);
            expect(Object.keys(query).length).to.equal(2);
            expect(query.name).to.equal('treelite');
            expect(query.age).to.equal('10');
        });

        it('with array', function () {
            var query = 'name=treelite&name=c.xinle&age=10';

            query = parse(query);
            expect(Object.keys(query).length).to.equal(2);
            expect(Array.isArray(query.name)).to.be.ok;
            expect(query.name.length).to.equal(2);
            expect(query.name[0]).to.equal('treelite');
            expect(query.name[1]).to.equal('c.xinle');
            expect(query.age).to.equal('10');
        });

        it('with empty and null', function () {
            var query = 'name=treelite&email&age=';

            query = parse(query);
            expect(Object.keys(query).length).to.equal(3);
            expect(query.name).to.equal('treelite');
            expect(query.email).to.be.null;
            expect(query.age).to.equal('');
        });

        it('with unnecessary \'&\'', function () {
            var query = 'name=treelite&&age=10&';

            query = parse(query);
            expect(Object.keys(query).length).to.equal(2);
            expect(query.name).to.equal('treelite');
            expect(query.age).to.equal('10');
        });

        it('with encode string', function () {
            var query = 'company='
                        + encodeURIComponent('百度')
                        + '&company='
                        + encodeURIComponent('淘宝')
                        + '&address='
                        + encodeURIComponent('北京');

            query = parse(query);
            expect(Object.keys(query).length).to.equal(2);
            expect(Array.isArray(query.company)).to.be.ok;
            expect(query.company[0]).to.deep.equal('百度');
            expect(query.company[1]).to.deep.equal('淘宝');
            expect(query.address).to.deep.equal('北京');
        });

    });

});
