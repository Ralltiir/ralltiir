/**
 * @file doc.js Root document container for all SF pages
 * @author harttle<yangjun14@baidu.com>
 */

define(function () {

    function docFactory(mainDoc) {
        var doc = mainDoc.querySelector('#sfr-app');
        if (!doc) {
            doc = mainDoc.createElement('div');
            doc.setAttribute('id', 'sfr-app');
        }

        doc.ensureAttached = ensureAttached;
        doc.ensureAttached();

        function ensureAttached() {
            if (!mainDoc.contains(doc)) {
                mainDoc.body.appendChild(doc);
            }
        }

        return doc;
    }

    return docFactory;
});
