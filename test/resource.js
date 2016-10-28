/*
 * @author yangjun14(yangjvn@126.com)
 * @file 测试src/resource.js
 */

define(['../src/resource'], function(Resource) {
    describe('resource', function() {
        this.timeout(5000);
        var xhr, fake, timeout;

        before(function() {
            fake = sinon.useFakeXMLHttpRequest();
            fake.onCreate = function(_xhr) {
                xhr = _xhr;
            };
        });

        after(function() {
            fake.restore();
        });

        beforeEach(function() {
            timeout = setTimeout(function() {
                if (!xhr) return;
                if (xhr.url === 'http://json.com/person/1/cat/2') {
                    xhr.respond(200, {
                        'Content-Type': 'application/json'
                    }, '{"id": 2, "name": "harttle"}');
                } else if (xhr.url === 'http://json.com/person/1/cat/') {
                    xhr.respond(200, {
                        'Content-Type': 'application/json'
                    }, '[{"id": 2, "name": "harttle"}]');
                } else {
                    xhr.respond(400);
                }
            }, 100);
        });

        afterEach(function() {
            clearTimeout(timeout);
        });

        describe('resource', function() {
            var Cat = new Resource('http://json.com/person/:pid/cat/:id');
            it('should create a RESTful item', function(done) {
                var cat = {
                    name: 'harttle'
                };
                var query = {
                    pid: 1
                };
                Cat.create(cat, query).then(function(cats, status, xhr) {
                    expect(xhr.url).to.equal('http://json.com/person/1/cat/');
                    expect(xhr.method).to.equal('POST');
                    expect(xhr.requestBody).to.equal('name=harttle');
                    done();
                }).catch(done);
            });
            it('should query a RESTful item', function(done) {
                var cat = {
                    pid: 1,
                    id: 2
                };
                Cat.query(cat).then(function(cat, status, xhr) {
                    expect(xhr.url).to.equal('http://json.com/person/1/cat/2');
                    expect(xhr.method).to.equal('GET');
                    done();
                }).catch(done);
            });
            it('should query RESTful items', function(done) {
                var cat = {
                    pid: 1
                };
                Cat.query(cat).then(function(cats, status, xhr) {
                    expect(xhr.url).to.equal('http://json.com/person/1/cat/');
                    expect(xhr.method).to.equal('GET');
                    expect(cats).to.deep.equal([{
                        id: 2,
                        name: 'harttle'
                    }]);
                    done();
                }).catch(done);
            });
            it('should update a RESTful item', function(done) {
                var cat = {
                    name: 'harttle'
                };
                var query = {
                    pid: 1,
                    id: 2
                };
                Cat.update(cat, query).then(function(cats, status, xhr) {
                    expect(xhr.url).to.equal('http://json.com/person/1/cat/2');
                    expect(xhr.method).to.equal('PUT');
                    expect(xhr.requestBody).to.contain('name=harttle');
                    done();
                }).catch(done);
            });
            it('should delete a RESTful item', function(done) {
                var query = {
                    pid: 1,
                    id: 2
                };
                Cat.delete(query).then(function(cats, status, xhr) {
                    expect(xhr.url).to.equal('http://json.com/person/1/cat/2');
                    expect(xhr.method).to.equal('DELETE');
                    done();
                }).catch(done);
            });
        });
    });
});
