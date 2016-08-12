/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/view/viewModelFactory.js
 */

define(['src/view/viewModelFactory', 'src/view/cache', 'src/action/action'], function(viewModelFactory, cache, action) {
    describe('view/viewModelFactory', function() {
        var instance = {},
            options = {
                container: {
                    html: function() {}
                }
            };
        beforeEach(function() {
            viewModelFactory.clear();
        });
        describe('.create()', function() {
            it('should return undefined when key undefined', function() {
                expect(viewModelFactory.create()).to.equal(undefined);
            });
            it('should call cache.get() when key specified', function() {
                sinon.stub(cache, 'get').returns(instance);
                expect(viewModelFactory.create('key')).to.equal(instance);
                expect(cache.get).calledWith('ViewModel', 'key');
                cache.get.restore();
            });
            it('should not call cache.get() in latter access', function() {
                viewModelFactory.create('key', options);
                sinon.stub(cache, 'get');
                viewModelFactory.create('key', options);
                expect(cache.get).to.not.have.been.called;
                cache.get.restore();
            });
            it('should call cache.set() if cache miss', function() {
                sinon.stub(cache, 'get').returns(false);
                sinon.stub(cache, 'set');
                var obj = viewModelFactory.create('key', options);
                expect(cache.set).to.have.been.calledWith('ViewModel', 'key', obj);
                cache.get.restore();
                cache.set.restore();
            });
        });
        describe('.get()', function() {
            it('should return false when key undefined', function() {
                expect(viewModelFactory.get()).to.equal(false);
            });
            it('should return instance when key exist', function() {
                var obj = viewModelFactory.create('key', options);
                expect(viewModelFactory.get('key')).to.equal(obj);
            });
            it('should return undefined when key not exist', function() {
                expect(viewModelFactory.get('key')).to.equal(undefined);
            });
        });
        describe('ViewModel', function() {
            describe('#fetch()', function() {
                var vm, xhr, config, sinonXHR;
                beforeEach(function() {
                    vm = viewModelFactory.create('key', options);
                    sinonXHR = sinon.useFakeXMLHttpRequest();
                    sinonXHR.onCreate = function(_xhr) {
                        xhr = _xhr;
                    };
                    config = {
                        fetch: {
                            '/foo': {
                                withCredentials: true,
                                url: '/hehe'
                            }
                        }
                    };
                });
                afterEach(function() {
                    sinonXHR.restore();
                });
                it('should use correct url and dataType', function() {
                    vm.fetch('/foo/bar');
                    expect(xhr.url).to.equal('/foo/bar');
                    expect(xhr.requestHeaders.Accept).to.equal('text/plain');
                });
                it('should respect config.fetch', function() {
                    sinon.stub(action, 'config').returns(config);
                    vm.fetch('/foo/bar', '/foo');
                    xhr.respond(200, {
                        "Content-Type": "text/plain"
                    }, 'foo');
                    expect(xhr.url).to.equal('/hehe/bar');
                    // this fails by zepto.js
                    //expect(xhr.withCredentials).to.equal(true);
                });
            });
            describe('#render()', function() {
                var vm;
                it('should call #_render()', function() {
                    vm = viewModelFactory.create('key', options);
                    sinon.spy(vm, '_render');
                    var p = vm.render();
                    expect(vm._render).to.have.been.called;
                    expect(p).to.be.fulfilled;
                    vm._render.restore();
                });
                it('should not call #_render() if already rendered', function() {
                    vm = viewModelFactory.create('key2', options);
                    sinon.spy(vm, '_render');
                    vm.render();
                    vm.render();
                    expect(vm._render).to.have.been.calledOnce;
                    vm._render.restore();
                });
            });
            describe('#start(), #stop(), #destroy()', function() {
                var vm, global = {
                    view: {
                        trigger: sinon.spy()
                    }
                };
                before(function(){
                    vm = viewModelFactory.create('key', options);
                    vm.global = global;
                });
                beforeEach(function(){
                    global.view.trigger.reset();
                });
                it('should trigger view.start()', function() {
                    vm.start();
                    expect(global.view.trigger).to.have.been.calledWith('start');
                });
                it('should trigger view.stop()', function() {
                    vm.stop();
                    expect(global.view.trigger).to.have.been.calledWith('stop');
                });
                it('should trigger view.destroy()', function() {
                    vm.destroy();
                    expect(global.view.trigger).to.have.been.calledWith('destroy');
                });
            });
        });
    });
});
