/**
 * saber-lang test case
 *
 * @author firede[firede@firede.us]
 */

define(function(require) {
    var extend = require('router/lang/extend');
    var inherits = require('router/lang/inherits');

    describe('lang', function() {

        it('.extend(target, source)', function() {
            var a = {x: 1, y: 2};
            var b = {y: 3, z: 4};
            var c = extend(a, b);

            expect(a).toBe(c);
            expect(a).toEqual({x: 1, y: 3, z: 4});
        });

        it('.extend(target, ...source)', function() {
            var obj1 = {a: 1, b: 2};
            var obj2 = {b: 3, c: 4};
            var obj3 = {c: 4, d: 5};
            var obj = extend(obj1, obj2, obj3);

            expect(obj1).toBe(obj);
            expect(obj1).toEqual({a: 1, b: 3, c: 4, d: 5});
        });

        it('.extend: with prototype', function () {
            var a = {x: 1, y: 2};
            var B = function () {};
            B.prototype.hi = function () {};
            var b = new B();
            b.y = 3;
            b.z = 4;

            extend(a, b);
            expect(a).toEqual({x: 1, y: 3, z: 4});
        });

        it('.extend: source is null', function () {
            var a = {x: 1, y: 2};

            extend(a, null);
            expect(a).toEqual({x: 1, y: 2});
        });

        it('.inherits(subClass, superClass)', function() {
            function Func1(name) {
                this.name = name;
            }
            Func1.prototype.say = function() {
                return 'hi, ' + this.name;
            };
            function Func2(name) {
                this.name = name + '!';
            }
            inherits(Func2, Func1);

            var instance1 = new Func1('saber');
            var instance2 = new Func2('baidu');

            expect(instance1.say()).toBe('hi, saber');
            expect(instance2.say()).toBe('hi, baidu!');

            expect(instance1.constructor).toBe(Func1);
            expect(instance2.constructor).toBe(Func2);

            expect(instance1 instanceof Func1).toBeTruthy();
            expect(instance2 instanceof Func2).toBeTruthy();
            expect(instance2 instanceof Func1).toBeTruthy();
        });

    });

});
