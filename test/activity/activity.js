/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/activity/activity.js
 */

define(['src/activity/activity', 'src/view/viewFactory'], function(Activity, viewFactory) {
    describe('activity/activity', function() {
        var scope, view, activity;
        beforeEach(function() {
            scope = {
                from: {
                    url: '/bar/foo',
                    options: {
                        view: {
                            _hold: 0
                        }
                    }
                },
                to: {
                    url: '/foo/bar',
                    query: {
                        title: 'title',
                        word: 'word'
                    },
                    options: {
                        view: {
                            foo: 'bar'
                        }
                    }
                }
            };
            view = {
                set: sinon.spy(),
                render: sinon.spy(),
                start: sinon.spy(),
                stop: sinon.spy(),
                destroy: sinon.spy(),
                change: sinon.spy(),
                create: sinon.spy()
            };
            sinon.stub(viewFactory, 'create').returns(view);
            sinon.stub(viewFactory, 'get').returns(view);
            sinon.stub(viewFactory, 'destroy');
            activity = new Activity();
        });
        afterEach(function() {
            viewFactory.create.restore();
            viewFactory.get.restore();
            viewFactory.destroy.restore();
        });
        describe('new', function(){
            it('should construct with no error', function(){
                function fn(){
                    var a = Activity()
                }
                expect(fn).to.not.throw();
            });
        });
        describe('#create()', function(){
            var createPromise;
            beforeEach(function(){
                createPromise = activity.create(scope);
            });
            it('should call viewFactory.create() with scope.to.url', function(){
                return createPromise.then(function(){
                    expect(viewFactory.create).to.have.been
                        .calledWith(scope.to.url);
                });
            });
            it('should set view options to view', function(){
                expect(view.set).to.have.been.calledWithMatch({
                    foo: 'bar'
                });
            });
            it('should set view headTitle to title', function(){
                expect(view.set).to.have.been.calledWithMatch({
                    headTitle: 'title'
                });
            });
            it('should call view.create() with scope', function(){
                return createPromise.then(function(){
                    expect(view.create).to.have.been.calledWith(scope);
                });
            });
            it('should call view.render() before view.create()', function(){
                return createPromise.then(function(){
                    expect(view.render).to.have.been.calledBefore(view.create);
                });
            });
        });
        describe('#start()', function(){
            var startPromise;
            beforeEach(function(){
                startPromise = activity.start(scope);
            });
            it('should call viewFactory.get() with scope.to.url', function(){
                return startPromise.then(function(){
                    expect(viewFactory.get).to.have.been
                        .calledWith(scope.to.url);
                });
            });
            it('should call view.start() with scope', function(){
                return startPromise.then(function(){
                    expect(view.start).to.have.been.calledWith(scope);
                });
            });
        });

        describe('#stop()', function(){
            var stopPromise;
            beforeEach(function(){
                stopPromise = activity.stop(scope);
            });
            it('should call viewFactory.get() with scope.from.url', function(){
                return stopPromise.then(function(){
                    expect(viewFactory.get).to.have.been
                        .calledWith(scope.from.url);
                });
            });
            it('should call view.stop() with scope', function(){
                return stopPromise.then(function(){
                    expect(view.stop).to.have.been.calledWith(scope);
                });
            });
        });

        describe('#destroy()', function(){
            var destroyPromise;
            beforeEach(function(){
                destroyPromise = activity.destroy(scope);
            });
            it('should call viewFactory.get() with scope.from.url', function(){
                return destroyPromise.then(function(){
                    expect(viewFactory.get).to.have.been
                        .calledWith(scope.from.url);
                });
            });
            it('should call viewFactory.destroy() with scope', function(){
                return destroyPromise.then(function(){
                    expect(viewFactory.destroy).to.have.been.calledWith(scope);
                });
            });
            it('should set scope.from.options.view._hold to 1 at least', function(){
                return destroyPromise.then(function(){
                    expect(scope.from.options.view._hold).to.least(1);
                    scope.from.options.view._hold = 8;
                    expect(scope.from.options.view._hold).to.equal(8);
                });
            });
            it('should set scope.from.options.view._hold to 2 for Android UC Browser', function(){
                if((/android/i.test(window.navigator.userAgent) && /UCBrowser/i.test(window.navigator.userAgent))) {
                    expect(scope.from.options.view._hold).to.equal(2);
                }
            });
        });

        describe('#on()', function(){
            var spy, activity;
            beforeEach(function(){
                activity = new Activity();
                spy = sinon.spy();
            });
            it('should call onCreate()', function(){
                activity.on('create', spy);
                return activity.create(scope).then(function(){
                    expect(spy).have.been.calledWith(scope, view);
                    expect(spy).have.been.calledOn(activity);
                });
            });
            it('should call onStart() with scope and view', function(){
                activity.on('start', spy);
                return activity.start(scope).then(function(){
                    expect(spy).have.been.calledWith(scope, view);
                });
            });
            it('should call onStart() on activity', function(){
                activity.on('start', spy);
                return activity.start(scope).then(function(){
                    expect(spy).have.been.calledOn(activity);
                });
            });
            it('should call onStart() after view.start()', function(){
                activity.on('start', spy);
                return activity.start(scope).then(function(){
                    expect(spy).to.have.been.calledAfter(view.start);
                });
            });
            it('should call onStop() with scope and view', function(){
                activity.on('stop', spy);
                return activity.stop(scope).then(function(){
                    expect(spy).have.been.calledWith(scope, view);
                });
            });
            it('should call onStop() on activity', function(){
                activity.on('stop', spy);
                return activity.stop(scope).then(function(){
                    expect(spy).have.been.calledOn(activity);
                });
            });
            it('should call onStop() before view.stop()', function(){
                activity.on('stop', spy);
                return activity.stop(scope).then(function(){
                    expect(spy).to.have.been.calledBefore(view.stop);
                });
            });
            it('should call onDestroy() with scope and view', function(){
                activity.on('destroy', spy);
                return activity.destroy(scope).then(function(){
                    expect(spy).have.been.calledWith(scope, view);
                });
            });
            it('should call onDestroy() on activity', function(){
                activity.on('destroy', spy);
                return activity.destroy(scope).then(function(){
                    expect(spy).have.been.calledOn(activity);
                });
            });
            it('should call onDestroy() before viewFactory.destroy()', function(){
                activity.on('destroy', spy);
                return activity.destroy(scope).then(function(){
                    expect(spy).to.have.been.calledBefore(viewFactory.destroy);
                });
            });
        });
    });
});
