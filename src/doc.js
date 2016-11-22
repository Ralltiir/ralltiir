di.factory('doc', function(container){
    var mainDoc = container.document;

    var doc = mkDoc();
    mainDoc.body.appendChild(doc);
    return doc;

    function mkDoc(){
        var doc = mainDoc.createElement('div');
        doc.setAttribute('class', 'sfr-app');
        return doc;
    }
});
