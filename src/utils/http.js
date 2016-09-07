define(['./promise', './underscore'], function(Promise, _) {
    var exports = {};

    /*
     * @param url
     * @param settings
     * @return a promise.
     *   .then(function( data, textStatus, xhr ) {});
     *   .catch(function( xhr, textStatus, errorThrown ) {});
     *   .finally(function( data|xhr, textStatus, xhr|errorThrown ) { });
     */
    exports.ajax = function(url, settings) {
        //console.log('ajax with', url, settings);
        if (typeof url === 'object') {
            settings = url;
            url = "";
        }
        settings = _.defaults(settings, {
            url: url,
            method: settings && settings.type || 'GET',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: null,
            jsonp: false,
            jsonpCallback: 'cb'
        });
        if (settings.data instanceof FormData) {
            settings.contentType = 'multipart/form-data';
        } else if (typeof settings.data === 'object') {
            settings.contentType = 'application/json';
            settings.data = JSON.stringify(settings.data);
        }
        return _doAjax(settings);
    };

    exports.get = function(url, data) {
        return exports.ajax(url, {
            data: data
        });
    };

    exports.post = function(url, data) {
        return exports.ajax(url, {
            method: 'POST',
            data: data
        });
    };

    exports.put = function(url, data) {
        return exports.ajax(url, {
            method: 'PUT',
            data: data
        });
    };

    exports.delete = function(url, data) {
        return exports.ajax(url, {
            method: 'DELETE',
            data: data
        });
    };

    function _doAjax(settings) {
        //console.log('_doAjax with', settings);
        var xhr;
        try {
            xhr = _createXHR();
        } catch (e) {
            return Promise.reject(null, '', e);
        }
        //console.log('open xhr');
        xhr.open(settings.method, settings.url, true);

        return new Promise(function(resolve, reject) {
            xhr.onreadystatechange = function() {
                //console.log('onreadystatechange', xhr.readyState, xhr.status);
                if (xhr.readyState == 4) {
                    xhr = _resolveXHR(xhr);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseBody, xhr.status, xhr);
                    } else {
                        reject(xhr, xhr.status, null);
                    }
                }
            };
            xhr.send(settings.data);
        });
    }

    function _resolveXHR(xhr) {
        /*
         * parse response headers
         */
        var headers = xhr.getAllResponseHeaders()
            // Spec: https://developer.mozilla.org/en-US/docs/Glossary/CRLF
            .split('\r\n')
            .filter(_.negate(_.isEmpty))
            .map(function(str) {
                return _.split(str, /\s*:\s*/);
            });
        xhr.responseHeaders = _.fromPairs(headers);

        /*
         * parse response body
         */
        xhr.responseBody = xhr.responseText;
        if(xhr.responseHeaders['Content-Type'] === 'application/json'){
            try{
                xhr.responseBody = JSON.parse(xhr.responseText);
            }
            catch(e){
                console.warn('Invalid JSON content with Content-Type: application/json');
            }
        }
        return xhr;
    }

    function _createXHR() {
        //console.log('create xhr');
        var xhr = false;

        if (window.XMLHttpRequest) { // Mozilla, Safari,...
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) { // IE
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
        if (!xhr) {
            throw 'Cannot create an XHR instance';
        }
        return xhr;
    }

    return exports;
});
