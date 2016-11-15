describe('doc', function() {
    var doc;

    beforeEach(function() {
        di.value('document', window.document);
    });

    it('should create div.sfa', function() {
        // access the doc
        doc = di.container.doc;
        var div = document.querySelector('div.sfa');
        expect(div).to.be.ok;
    });
});
