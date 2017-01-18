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
            var result = mainDoc.querySelector('#sfr-app');
            if (!result) {
                mainDoc.body.appendChild(doc);
            }
        }

        return doc;
    }

    return docFactory;
});
