define(function() {

    function docFactory(mainDoc) {
        var doc = mainDoc.querySelector('#sfr-app');
        if (!doc) {
            doc = mainDoc.createElement('div');
            doc.setAttribute('id', 'sfr-app');
        }

        doc.ensureAttached = ensureAttached;
        doc.ensureAttached();

        function ensureAttached() {
            if (!contains(mainDoc, doc)) {
                mainDoc.body.appendChild(doc);
            }
        }

        function contains(parent, descendant) {
            return parent == descendant ||
                Boolean(parent.compareDocumentPosition(descendant) & 16);
        }

        return doc;
    }

    return docFactory;
});
