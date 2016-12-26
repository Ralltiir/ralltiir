define(['../src/lang/map'], function(Map) {
    describe('Map', function() {
		var map;
		beforeEach(function() {
			map = new Map();
		});
		describe('#set()', function(){
            it('should set k/v', function(){
                expect(map.size).to.equal(0);
				map.set('k1', 'v');
                expect(map.size).to.equal(1);
				map.set('k2', 'v');
                expect(map.size).to.equal(2);
            });
			it('should not set redundent keys', function() {
				map.set('k', 'v');
				expect(map.size).to.equal(1);
				map.set('k', 'v');
				expect(map.size).to.equal(1);
			});
        });
		describe('#get()', function() {
			it('should get by String key', function() {
				map.set('k', 'v');
				expect(map.get('k')).to.equal('v');
			});
			it('should get by RegExp key', function() {
				map.set(/f/, 'regexp');
				map.set('/f/', 'string');
				expect(map.size).to.equal(2);
				expect(map.get(/f/)).to.equal('regexp');
				expect(map.get('/f/')).to.equal('string');
			});
		});
		describe('#delete', function(){
			beforeEach(function(){
				map.set('/f/', 'string');
				map.set(/f/, 'regexp');
			});
			it('should delete by key', function() {
				map.delete('/f/');
				expect(map.size).to.equal(1);
				expect(map.get('/f/')).to.equal(undefined);
				expect(map.get(/f/)).to.equal('regexp');
			});
			it('should not decrease size when key not exist', function() {
				map.delete('foo');
				expect(map.size).to.equal(2);
			});
			it('should handle empty size', function() {
				map.delete('/f/');
				map.delete(/f/);
				map.delete(/f/);
				expect(map.size).to.equal(0);
			});
		});
		describe('#has()', function() {
			it('should return true if string key defined', function(){
				expect(map.has('foo')).to.be.false;
				map.set('foo', 'bar');
				expect(map.has('foo')).to.be.true;
			});
			it('should return true if RegExp key defined', function(){
				expect(map.has(/foo/)).to.be.false;
				map.set(/foo/, 'bar');
				expect(map.has(/foo/)).to.be.true;
			});
			it('should not conflict between string and RegExp', function(){
				map.set(/foo/, 'bar');
				expect(map.has('/foo/')).to.be.false;
				expect(map.has(/foo/)).to.be.true;
			});
		});
		describe('#clear()', function() {
			it('should clear all keys', function(){
				map.set('/foo/', 'bar');
				map.set(/foo/, 'bar');
				map.clear();
				expect(map.size).to.be.equal(0);
				expect(map.get('/foo/')).to.be.undefined;
				expect(map.get(/foo/)).to.be.undefined;
			});
		});
    });
});
