/*
 * @author yangjun14(yangjvn@126.com)
 * @file 测试src/utils/http.js
 */

define(['../src/utils/http'], function(http) {
    describe('http', function() {
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
                if (xhr.url === 'http://harttle.com') {
                    xhr.respond(200, {
                        'Content-Type': 'text/plain'
                    }, 'okay');
                } else if (xhr.url === 'http://baidu.com') {
                    xhr.respond(400, {
                        'Content-Type': 'text/plain'
                    }, 'bad');
                } else if (xhr.url === 'http://json.com') {
                    xhr.respond(200, {
                        'Content-Type': 'application/json',
                        'cache-control': 'no-cache'
                    }, '{"foo": "bar"}');
                }
            }, 100);
        });

        afterEach(function() {
            clearTimeout(timeout);
        });

        describe('.ajax()', function() {
            it('should return a thenable', function() {
                var p = http.ajax('http://harttle.com');
                expect(p.then).to.be.a('function');
            });
            it('should use correct url', function() {
                http.ajax('http://harttle.com');
                expect(xhr.url).to.equal('http://harttle.com');
            });
            it('should default method to GET', function() {
                http.ajax('http://harttle.com');
                expect(xhr.method).to.equal('GET');
            });
            it('should respect to port', function() {
                http.ajax('http://www.baidu.com:3000');
                expect(xhr.url).to.equal('http://www.baidu.com:3000');
            });
            it('should resolve when 200', function(done) {
                http.ajax('http://harttle.com')
                    .then(function(xhr) {
                        expect(xhr.status).to.equal(200);
                        expect(xhr.responseText).to.equal('okay');
                        expect(xhr.data).to.equal('okay');
                        done();
                    }).catch(done);
            });
            it('should reject when 400', function() {
                return http.ajax('http://baidu.com')
                    .catch(function(xhr) {
                        expect(xhr.responseText).to.equal('bad');
                        expect(xhr.status).to.equal(400);
                    });
            });
            it('should parse JSON for JSON MIME type', function() {
                return http.ajax('http://json.com')
                    .then(function(xhr) {
                        expect(xhr.data).to.deep.equal({
                            foo: 'bar'
                        });
                    });
            });
            it('should parse response headers', function() {
                return http.ajax('http://json.com')
                    .then(function(xhr) {
                        var h = xhr.responseHeaders;
                        expect(h['Content-Type']).to.equal('application/json');
                        expect(h['cache-control']).to.equal('no-cache');
                    });
            });
            it('should support xhrFields', function() {
                return http
                    .ajax('http://json.com', {
                        xhrFields: {
                            withCredentials: true
                        }
                    })
                    .then(function() {
                        expect(xhr.withCredentials).to.equal(true);
                    });
            });
            it('should urlencode request body by default', function() {
                return http
                    .ajax('http://json.com', {
                        method: 'POST',
                        data: {
                            foo: 'bar'
                        },
                        xhrFields: {
                            withCredentials: true
                        }
                    })
                    .then(function() {
                        expect(xhr.requestBody).to.equal("foo=bar");
                    });
            });
            it('should JSON encode when contentType set to application/json', function() {
                return http.ajax({
                        method: 'POST',
                        url: 'http://json.com',
                        data: {
                            foo: 'bar'
                        },
                        headers: {
                            'content-type': 'application/json'
                        }
                    })
                    .then(function() {
                        expect(xhr.requestBody).to.equal('{"foo":"bar"}');
                    });
            });
        });
        describe('.get()', function() {
            it('should perform GET', function() {
                return http.get('http://harttle.com')
                    .then(function(_xhr) {
                        expect(xhr.method).to.equal('GET');
                        expect(_xhr.data).to.equal('okay');
                    });
            });
        });
        describe('.post()', function() {
            it('should perform POST', function() {
                return http.post('http://harttle.com')
                    .then(function(_xhr) {
                        expect(xhr.method).to.equal('POST');
                        expect(_xhr.data).to.equal('okay');
                    });
            });
            it('should attach post data', function() {
                return http.post('http://harttle.com', {
                        foo: 'bar'
                    })
                    .then(function() {
                        expect(xhr.requestBody).to.equal('foo=bar');
                    });
            });
        });
        describe('.put()', function() {
            it('should perform PUT', function() {
                return http.put('http://harttle.com')
                    .then(function(_xhr) {
                        expect(xhr.method).to.equal('PUT');
                        expect(_xhr.data).to.equal('okay');
                    });
            });
        });
        describe('.delete()', function() {
            it('should perform DELETE', function() {
                return http.delete('http://harttle.com')
                    .then(function(_xhr) {
                        expect(xhr.method).to.equal('DELETE');
                        expect(_xhr.data).to.equal('okay');
                    });
            });
        });
    });
});
