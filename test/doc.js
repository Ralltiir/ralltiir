describe('doc', function() {
    var doc;

    beforeEach(function() {
        di.value('document', window.document);
    });

    it('should create div#sfr-app', function() {
        // access the doc
        doc = di.container.doc;
        var div = document.querySelector('div#sfr-app');
        expect(div).to.be.ok;
    });
});
