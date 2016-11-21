/**
 * @file test
 * @author Firede(firede@firede.us)
 */

// use `component/emitter` test case:
// https://github.com/component/emitter/blob/master/test/emitter.js

define(function(require) {
    var Emitter = require('utils/emitter');

    describe('router/emitter', function() {
        describe('Custom', function() {
            function Custom() {
                Emitter.call(this);
            }
            Emitter.mixin(Custom.prototype);

            describe('with Emitter.call(this)', function() {
                it('should work', function() {
                    var emitter = new Custom();
                    var done = false;

                    emitter.on('foo', function() {
                        done = true;
                    });
                    emitter.emit('foo');

                    expect(done).to.equal(true);
                });
            });
        });

        describe('Emitter', function() {

            describe('.on(event, listener)', function() {
                it('should add listeners', function() {
                    var emitter = new Emitter();
                    var result = [];

                    emitter.on('foo', function(value) {
                        result.push('one', value);
                    });

                    emitter.on('foo', function(value) {
                        result.push('two', value);
                    });

                    emitter.emit('foo', 'test');
                    emitter.emit('foo', 1);
                    emitter.emit('bar', 2);

                    expect(result).to.deep.equal(
                        ['one', 'test', 'two', 'test', 'one', 1, 'two', 1]
                    );
                });

                it('.setMaxListeners(number)', function() {
                    var done = false;
                    var emitter = new Emitter();
                    emitter.setMaxListeners(2);

                    emitter.on('baz', function() {
                        console.log('a');
                    });
                    emitter.on('baz', function() {
                        console.log('b');
                    });

                    try {
                        emitter.on('baz', function() {
                            console.log('c');
                        });
                    } catch (e) {
                        if (e.name === 'RangeError') {
                            done = true;
                        }
                    }

                    expect(done).to.equal(true);
                });

            });

            describe('.once(event, listener)', function() {
                it('should add a single-shot listener', function() {
                    var emitter = new Emitter();
                    var result = [];

                    emitter.once('foo', function(value) {
                        result.push('one', value);
                    });

                    emitter.emit('foo', 1);
                    emitter.emit('foo', 2);
                    emitter.emit('foo', 3);
                    emitter.emit('bar', 1);

                    expect(result).to.deep.equal(['one', 1]);
                });
            });

            describe('.off(event, listener)', function() {
                it('should remove a listener', function() {
                    var emitter = new Emitter();
                    var result = [];

                    function one() {
                        result.push('one');
                    }

                    function two() {
                        result.push('two');
                    }

                    emitter.on('foo', one);
                    emitter.on('foo', two);
                    emitter.off('foo', two);

                    emitter.emit('foo');

                    expect(result).to.deep.equal(['one']);
                });

                it('should work with .once()', function() {
                    var emitter = new Emitter();
                    var result = [];

                    function one() {
                        result.push('one');
                    }

                    emitter.once('foo', one);
                    emitter.once('bar', one);
                    emitter.off('foo', one);

                    emitter.emit('foo');

                    expect(result).to.deep.equal([]);
                });

                it('should work when called from an event', function() {
                    var emitter = new Emitter();
                    var called;

                    function b() {
                        called = true;
                    }

                    function c() {
                        emitter.off('tobi', b);
                    }

                    emitter.on('tobi', c);
                    emitter.on('tobi', b);

                    emitter.emit('tobi');
                    expect(called).to.equal(true);

                    called = false;
                    emitter.emit('tobi');
                    expect(called).to.equal(false);
                });
            });

            describe('.off(event)', function() {
                it('should remove all listeners for an event', function() {
                    var emitter = new Emitter();
                    var result = [];

                    function one() {
                        result.push('one');
                    }

                    function two() {
                        result.push('two');
                    }

                    emitter.on('foo', one);
                    emitter.on('foo', two);
                    emitter.off('foo');

                    emitter.emit('foo');
                    emitter.emit('foo');

                    expect(result).to.deep.equal([]);
                });
            });

            describe('.off()', function() {
                it('should remove all listeners', function() {
                    var emitter = new Emitter();
                    var result = [];

                    function one() {
                        result.push('one');
                    }

                    function two() {
                        result.push('two');
                    }

                    emitter.on('foo', one);
                    emitter.on('bar', two);

                    emitter.emit('foo');
                    emitter.emit('bar');

                    emitter.off();

                    emitter.emit('foo');
                    emitter.emit('bar');

                    expect(result).to.deep.equal(['one', 'two']);
                });
            });

            describe('.listeners(event)', function() {
                describe('when handlers are present', function() {
                    it('should return an array of callbacks', function() {
                        var emitter = new Emitter();

                        function foo() {}
                        emitter.on('foo', foo);

                        expect(emitter.listeners('foo')).to.deep.equal([foo]);
                    });
                });

                describe('when no handlers are present', function() {
                    it('should return an empty array', function() {
                        var emitter = new Emitter();

                        expect(emitter.listeners('foo')).to.deep.equal([]);
                    });
                });
            });

        });

        describe('Emitter.mixin(obj)', function() {
            it('should mixin', function() {
                var done = false;
                var emitter = {};
                Emitter.mixin(emitter);

                emitter.on('foo', function() {
                    done = true;
                });
                emitter.emit('foo');

                expect(done).to.equal(true);
            });
        });
    });
});
