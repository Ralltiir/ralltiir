define(
    function () {
        var TPL = ''
        +'<div>'
        +   '#title'
        +'</div>';
        
        function View() {
            this.tpl = '';
        }

        View.prototype = {
            init: function (opt) {
                this.dom = $(TPL.replace('#title', opt.title));
            },

            create: function () {
                $('#viewArea').append(this.dom);
            },

            show: function () {
                
            },

            hide: function () {
                      
            },
            change: function (opt) {
                this.dom.html(opt.title);
            },
            destroy: function (opt) {
                this.dom.remove();         
            }
        };

        return View;
    }        
);
