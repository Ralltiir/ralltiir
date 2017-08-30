/**
 * @author harttle<yangjun14@baidu.com>
 * @file 测试src/Promise.js. 标准： Promises/A+ https://Promisesaplus.com/
 */

/* eslint-env mocha */

/* eslint max-nested-callbacks: ["error", 5] */

/* globals sinon: true */

define(['lang/promise'], function (Promise) {
    describe('Promise', function () {
        this.timeout(5000);

        describe('new', function () {
            it('should throw when not called as a constructor', function () {
                function fn() {
                    // eslint-disable-next-line
                    Promise(function () {});
                }
                expect(fn).to.throw(/new/);
            });
            it('should throw on invalid arguments', function () {
                function fn() {
                    new Promise();
                }
                expect(fn).to.throw(/callback/);
            });
            it('should be thenable and catchable', function () {
                var p = new Promise(function () {});
                expect(p.then).to.be.a('function');
                expect(p.catch).to.be.a('function');
            });
        });
        describe('#then()', function () {
            it('should call then when resolved synchronously', function (done) {
                var p = new Promise(function (resolve) {
                    resolve('foo');
                });
                p.then(function (result) {
                    expect(result).to.equal('foo');
                    done();
                });
            });
            it('should call then when resolved asynchronously', function (done) {
                var p = new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve('foo');
                    }, 100);
                });
                p.then(function (result) {
                    expect(result).to.equal('foo');
                    done();
                });
            });
            it('should call chained then handlers in order', function () {
                var h1 = sinon.stub();
                var h2 = sinon.stub();
                return Promise.resolve('foo').then(h1).then(h2).then(function () {
                    expect(h1).have.been.calledBefore(h2);
                });
            });
            it('should await when then handler returns a thenable', function () {
                return Promise.resolve('init').then(function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve('foo');
                        }, 100);
                    });
                }).then(function (ret) {
                    expect(ret).to.equal('foo');
                });
            });
        });
        describe('#catch()', function () {
            it('should call catch when rejected synchronously', function () {
                var p = new Promise(function (resolve, reject) {
                    reject('foo');
                });
                return p.catch(function (err) {
                    expect(err).to.equal('foo');
                });
            });
            it('should call catch when rejected asynchronously', function () {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject('foo');
                    }, 100);
                }).catch(function (result) {
                    expect(result).to.equal('foo');
                });
            });
            it('should reject when then callback throws', function () {
                return Promise.resolve('foo').then(function () {
                    throw 'bar';
                }).catch(function (err) {
                    expect(err).to.equal('bar');
                });
            });
            it('should reject when then handler returns a rejected', function () {
                return Promise.resolve('init').then(function () {
                    return new Promise(function (resolve, reject) {
                        reject('foo');
                    });
                }).catch(function (err) {
                    expect(err).to.equal('foo');
                });
            });
            it('should resolve when catch callback resolves', function () {
                return Promise.reject('foo').catch(function () {
                    return 'bar';
                }).then(function (result) {
                    expect(result).to.equal('bar');
                });
            });
            it('should reject when catch callback rejects', function (done) {
                Promise.reject('foo').catch(function () {
                    throw 'bar';
                }).catch(function (err) {
                    expect(err).to.equal('bar');
                    done();
                });
            });
        });
        describe('.resolve()', function () {
            it('should resolve "foo" when given "foo"', function () {
                return Promise.resolve('foo').then(function (result) {
                    expect(result).to.equal('foo');
                });
            });
        });
        describe('#finally()', function (done) {
            it('should be called when resolved', function () {
                return Promise.resolve('foo').finally(function (result) {
                    expect(result).to.equal('foo');
                });
            });
            it('should be called when rejected', function () {
                return Promise.reject('foo').finally(function (result) {
                    expect(result).to.equal('foo');
                });
            });
        });
        describe('.reject()', function () {
            it('should reject "foo" when given "foo"', function () {
                return Promise.reject('foo').catch(function (err) {
                    expect(err).to.equal('foo');
                });
            });
        });
        describe('.fromCallback()', function () {
            it('should resolve when callback called', function () {
                return expect(Promise.fromCallback(function (cb) {
                    cb('foo');
                })).to.eventually.equal('foo');
            });
            it('should reject when callback throws', function () {
                return expect(Promise.fromCallback(function (cb) {
                    throw 'bar';
                })).to.eventually.be.rejectedWith('bar');
            });
        });
        describe('.all()', function () {
            it('should resolve when all resolved', function () {
                return Promise.all([
                    Promise.resolve('foo'),
                    Promise.resolve('bar')
                ]).then(function (arr) {
                    expect(arr).to.deep.equal(['foo', 'bar']);
                });
            });
            it('should reject when one rejected', function () {
                return Promise
                    .all([Promise.resolve('foo'), Promise.reject('bar')])
                    .catch(function (err) {
                        return expect(err).to.equal('bar');
                    });
            });
            it('should support non-thenable', function () {
                return Promise.all([Promise.resolve('foo'), 'bar'])
                    .then(function (arr) {
                        expect(arr).to.deep.equal(['foo', 'bar']);
                    });
            });
            it('should resolve empty array', function () {
                return Promise.all([]);
            });
        });
        describe('.mapSeries()', function () {
            it('should resolve when all resolved', function () {
                var p = Promise.mapSeries(['first', 'second', 'third'], function (item) {
                    return Promise.resolve(item);
                });
                return expect(p).to.eventually.deep.equal(['first', 'second', 'third']);
            });
            it('should reject with the error that first callback rejected', function () {
                var p = Promise.mapSeries(['first', 'second'], function (item) {
                    return Promise.reject(item);
                });
                return expect(p).to.rejectedWith('first');
            });
            it('should resolve in series', function () {
                var spy1 = sinon.spy();
                var spy2 = sinon.spy();
                return Promise
                    .mapSeries(
                        ['first', 'second'], function (item, idx) {
                            return new Promise(function (resolve, reject) {
                                if (idx === 0) {
                                    setTimeout(function () {
                                        spy1();
                                        resolve('first cb');
                                    }, 10);
                                }
                                else {
                                    spy2();
                                    resolve('foo');
                                }
                            });
                        }
                )
                    .then(function () {
                        expect(spy2).to.have.been.calledAfter(spy1);
                    });
            });
            it('should not call rest of callbacks once rejected', function () {
                var spy = sinon.spy();
                return Promise.mapSeries(['first', 'second'], function (item, idx) {
                    if (idx > 0) {
                        spy();
                    }

                    return Promise.reject(new Error(item));
                })
                    .catch(function () {
                        expect(spy).to.not.have.been.called;
                    });
            });
        });
        describe('unhandledrejection', function () {
            var handler;
            beforeEach(function () {
                handler = sinon.spy();
                window.addEventListener('unhandledrejection', handler);
            });
            afterEach(function () {
                window.removeEventListener('unhandledrejection', handler);
            });
            it('should throw PromiseRejectionEvent', function (done) {
                Promise.reject('foo');
                setTimeout(function () {
                    expect(handler).to.have.been.calledWithMatch({
                        reason: 'foo',
                        type: 'unhandledrejection'
                    });
                    done();
                }, 500);
            });
            it('should not throw when error handled', function (done) {
                Promise.reject('foo').catch(function () {});
                setTimeout(function () {
                    expect(handler).to.have.not.been.calledWithMatch({
                        reason: 'foo',
                        type: 'unhandledrejection'
                    });
                    done();
                }, 100);
            });
            it('should throw when error re-throwed', function (done) {
                Promise.reject('foo').catch(function (e) {
                    throw e;
                });
                setTimeout(function () {
                    expect(handler).to.have.been.calledWithMatch({
                        reason: 'foo',
                        type: 'unhandledrejection'
                    });
                    done();
                }, 100);
            });
            it('should not throw when no error occurred', function (done) {
                Promise.resolve('foo');
                setTimeout(function () {
                    expect(handler).to.have.not.been.calledWithMatch({
                        reason: 'foo',
                        type: 'unhandledrejection'
                    });
                    done();
                }, 100);
            });
        });
    });
});
