define(['utils/http', 'utils/underscore'], function(http, _) {
    function Resource(url) {
        this.url = url;
    }
    Resource.prototype = {
        getUrl: function(opt){
            var url = this.url;
            // replace slugs with properties
            _.forOwn(opt, function(v, k) {
                url = url.replace(':' + k, v);
            });
            // remove remaining slugs
            url = url.replace(/:\w+/g, '');
            return url;
        },
        create: function(obj, opt) {
            var url = this.getUrl(opt);
            return http.post(url, obj);
        },
        query: function(opt) {
            var url = this.getUrl(opt);
            return http.get(url);
        },
        update: function(obj, opt) {
            var url = this.getUrl(opt);
            return http.put(url, obj);
        },
        delete: function(opt) {
            var url = this.getUrl(opt);
            return http.delete(url);
        },
    };
    return Resource;
});
