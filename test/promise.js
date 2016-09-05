/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/Promise.js. 标准： Promises/A+ https://Promisesaplus.com/
 */

define(['src/promise'], function(Promise) {
    describe('Promise', function() {
        it('should throw when not called as a constructor', function() {
            function fn() {
                Promise(function() {});
            }
            expect(fn).to.throw(/new/);
        });
        it('should throw on invalid arguments', function() {
            function fn() {
                new Promise();
            }
            expect(fn).to.throw(/callback/);
        });
        it('should be thenable and catchable', function() {
            var p = new Promise(function() {});
            expect(p.then).to.be.a('function');
            expect(p.catch).to.be.a('function');
        });
        describe('#then()', function() {
            it('should call then when resolved synchronously', function(done) {
                var p = new Promise(function(resolve) {
                    resolve('foo');
                });
                p.then(function(result) {
                    expect(result).to.equal('foo');
                    done();
                });
            });
            it('should call then when resolved asynchronously', function(done) {
                var p = new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve('foo');
                    }, 100);
                });
                p.then(function(result) {
                    expect(result).to.equal('foo');
                    done();
                });
            });
        });
        describe('#catch()', function() {
            it('should call catch when rejected synchronously', function(done) {
                var p = new Promise(function(resolve, reject) {
                    reject('foo');
                });
                p.catch(function(err) {
                    expect(err).to.equal('foo');
                    done();
                });
            });
            it('should call catch when rejected asynchronously', function(done) {
                var p = new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        reject('foo');
                    }, 100);
                });
                p.catch(function(result) {
                    expect(result).to.equal('foo');
                    done();
                });
            });
        });
        it('should support .resolve()', function(done) {
            Promise.resolve('foo').then(function(result) {
                expect(result).to.equal('foo');
                done();
            });
        });
        it('should support .reject()', function(done) {
            Promise.reject('foo').catch(function(err) {
                expect(err).to.equal('foo');
                done();
            });
        });
        describe('.all()', function() {
            it('should resolve when all resolved', function(done) {
                Promise.all([Promise.resolve('foo'), Promise.resolve('bar')])
                    .then(function(arr) {
                        expect(arr).to.deep.equal(['foo', 'bar']);
                        done();
                    });
            });
            it('should reject when one rejected', function(done) {
                Promise.all([Promise.resolve('foo'), Promise.reject('bar')])
                    .catch(function(err) {
                        expect(err).to.equal('bar');
                        done();
                    });
            });
            it('should support non-thenable', function(done) {
                Promise.all([Promise.resolve('foo'), 'bar'])
                    .then(function(arr) {
                        expect(arr).to.deep.equal(['foo', 'bar']);
                        done();
                    });
            });
        });

        describe('.then(), .catch() chain', function() {
            it('should call then handlers in order', function(done) {
                var h1 = sinon.stub();
                var h2 = sinon.stub();
                Promise.resolve('foo').then(h1).then(h2).then(function() {
                    expect(h1).have.been.calledBefore(h2);
                    done();
                });
            });
            it('should resolve when catch callback resolves', function(done) {
                Promise.reject('foo').catch(function() {
                    return 'bar';
                }).then(function(result) {
                    expect(result).to.equal('bar');
                    done();
                });
            });
            it('should reject when catch callback rejects', function(done) {
                Promise.reject('foo').catch(function() {
                    throw 'bar';
                }).catch(function(err) {
                    expect(err).to.equal('bar');
                    done();
                });
            });
            it('should reject when then callback throws', function(done) {
                Promise.resolve('foo').then(function() {
                    throw 'bar';
                }).catch(function(err) {
                    expect(err).to.equal('bar');
                    done();
                });
            });
        });
    });
});
