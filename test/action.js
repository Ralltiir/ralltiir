/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试src/action/action.js
 */

define(['src/action/action'], function(action) {
    describe('action/action', function() {
        describe('.regist()', function() {
            it('should not throw with undefined option', function() {
                function fn(){
                    action.regist('key');
                }
                expect(fn).to.throw(/illegal action option/);
            });
            it('should not throw with empty option', function() {
                function fn(){
                    action.regist('key', {});
                }
                expect(fn).to.not.throw();
            });
            it('should throw upon illegal name', function() {
                function fn(){
                    action.regist();
                }
                expect(fn).to.throw(/illegal action name/);
            });
        });
        describe('.run ()', function(){

        });
    });
});
