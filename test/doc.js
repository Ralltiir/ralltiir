require(['../src/doc'], function(docFactory) {
    describe('doc', function() {
        var doc;

        beforeEach(function() {
            document.querySelectorAll('#sfr-app').forEach(div => div.remove());
        });

        it('should create div#sfr-app if not exist', function() {
            doc = docFactory(window.document);
            var div = document.querySelector('div#sfr-app');
            expect(div).to.be.ok;
        });
        it('should use the div#sfr-app if exist', function() {
            var div = document.createElement('div');
            div.setAttribute('id', 'sfr-app');
            document.body.appendChild(div);

            doc = docFactory(window.document);
            var div = document.querySelectorAll('div#sfr-app');
            expect(div.length).to.equal(1);
        });

        describe('.ensureAttached()', function() {
            beforeEach(function(){
                sinon.spy(document.body, 'appendChild');
            });
            afterEach(function(){
                document.body.appendChild.restore();
            });
            it('should append to body when not attached', function(){
                var doc = docFactory(document);
                expect(document.body.appendChild).to.have.been.calledOnce;
                doc.remove();
                doc.ensureAttached();
                expect(document.querySelector('#sfr-app')).to.be.ok;
                expect(document.body.appendChild).to.have.been.calledTwice;
            });
            it('should not append when attached', function(){
                var doc = docFactory(document);
                expect(document.body.appendChild).to.have.been.calledOnce;
                doc.ensureAttached();
                expect(document.querySelector('#sfr-app')).to.be.ok;
                expect(document.body.appendChild).to.have.been.calledOnce;
            });
        });
    });
});
