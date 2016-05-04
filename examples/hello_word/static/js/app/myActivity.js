/*
 * @myActivity，自己实现的一个activity
 * @author houyu(houyu01@baidu.com)
 */
define(
    ['app/myView'],
    function (View) {

        function Detail() {
            this.view = new View();
        }
        
        Detail.prototype = {
            constructor: Detail,

            start: function (opt) {
                console.log('detail start!');
            },

            stop: function () {
                console.log('detail stop!');
            },

            create: function (opt) {
                console.log('detail create!');
                this.view.init(opt);
                this.view.create();
            },

            change: function (opt) {
                console.log('detail change!');
                this.view.change(opt);
            },

            destroy: function (opt) {
                console.log('detail destroy!');
                this.view.destroy(opt);
            }
        };

        //Detail.prototype = $.extend({}, Activity.prototype, Detail.prototype);

        return new Detail();
    }        
);
