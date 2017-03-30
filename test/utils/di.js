define(['../src/utils/di'], function(DI) {
    describe('di', function() {
        var di, require, modules, config;
        beforeEach(function() {
            modules = {
                'amd/family': sinon.stub().returns('a fine family'),
                'amd/female': sinon.stub().returns('Alice'),
                'amd/child': 'am a child'
            };
            config = {
                man: {
                    type: 'value',
                    value: 'hey man'
                },
                family: {
                    type: 'factory',
                    module: 'amd/family',
                    args: ['child', 'man']
                },
                child: {
                    type: 'value',
                    module: 'amd/child'
                },
                female: {
                    type: 'factory',
                    cache: false,
                    module: 'amd/female'
                }
            };
            require = function(mod) {
                return modules[mod];
            };
            di = new DI(config, require);
        });
        describe('#resolve()', function() {
            it('should throw when name not found', function() {
                expect(function (_) { return di.resolve('foo'); }).to.throw(/not found/);
            });
            it('should resolve value typed AMD module', function() {
                expect(di.resolve('man')).to.equal('hey man');
            });
            it('should resolve value typed direct value', function() {
                expect(di.resolve('child')).to.equal('am a child');
            });
            it('should resolve AMD module', function() {
                expect(di.resolve('family')).to.equal('a fine family');
            });
            it('should cache return value of factories', function() {
                di.resolve('family')
                expect(modules['amd/family']).to.have.been.calledOnce;
                di.resolve('family')
                expect(modules['amd/family']).to.have.been.calledOnce;
            });
            it('should not cache when disabled', function() {
                di.resolve('female')
                expect(modules['amd/female']).to.have.been.calledOnce;
                di.resolve('female')
                expect(modules['amd/female']).to.have.been.calledTwice;
            });
        });
        describe('#inject()', function() {
            var family;
            beforeEach(function() {
                family = di.resolve('family');
            });
            it('should return resolve parent', function() {
                expect(family).to.equal('a fine family');
            });
            it('should inject resolved modules', function() {
                expect(modules['amd/family']).to.have.been
                    .calledWith('am a child', 'hey man');
            });
        });
    });
});
