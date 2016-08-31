/**
 * @file parse-query spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var parse = require('router/uri/util/parse-query');

    describe('parse query', function () {

        it('with empty string', function () {
            var query = '';

            query = parse(query);
            expect(Object.keys(query).length).toBe(0);
        });

        it('with noraml string', function () {
            var query = 'name=treelite&age=10';

            query = parse(query);
            expect(Object.keys(query).length).toBe(2);
            expect(query.name).toBe('treelite');
            expect(query.age).toBe('10');
        });

        it('with array', function () {
            var query = 'name=treelite&name=c.xinle&age=10';

            query = parse(query);
            expect(Object.keys(query).length).toBe(2);
            expect(Array.isArray(query.name)).toBeTruthy();
            expect(query.name.length).toBe(2);
            expect(query.name[0]).toBe('treelite');
            expect(query.name[1]).toBe('c.xinle');
            expect(query.age).toBe('10');
        });

        it('with empty and null', function () {
            var query = 'name=treelite&email&age=';

            query = parse(query);
            expect(Object.keys(query).length).toBe(3);
            expect(query.name).toBe('treelite');
            expect(query.email).toBeNull();
            expect(query.age).toBe('');
        });

        it('with unnecessary \'&\'', function () {
            var query = 'name=treelite&&age=10&';

            query = parse(query);
            expect(Object.keys(query).length).toBe(2);
            expect(query.name).toBe('treelite');
            expect(query.age).toBe('10');
        });

        it('with encode string', function () {
            var query = 'company='
                        + encodeURIComponent('百度')
                        + '&company='
                        + encodeURIComponent('淘宝')
                        + '&address='
                        + encodeURIComponent('北京');

            query = parse(query);
            expect(Object.keys(query).length).toBe(2);
            expect(Array.isArray(query.company)).toBeTruthy();
            expect(query.company[0]).toEqual('百度');
            expect(query.company[1]).toEqual('淘宝');
            expect(query.address).toEqual('北京');
        });

    });

});
