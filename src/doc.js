define(function() {

    function docFactory(mainDoc) {
        var doc = mainDoc.querySelector('#sfr-app');
        if (!doc) {
            doc = mainDoc.createElement('div');
            doc.setAttribute('id', 'sfr-app');
            mainDoc.body.appendChild(doc);
        }
        return doc;
    }

    return docFactory;
});
