describe('doc', function() {
    var doc;

    beforeEach(function() {
        doc = di.container.doc;
    });

    it('should create div.sfa', function() {
        var div = document.querySelector('div.sfa');
        expect(div).to.be.ok;
    });
});
