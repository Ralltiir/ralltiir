define(function() {

	var View = require('view');
	var action = require('action');

    var sfView = new View();

    sfView.create = function() {
	    var me = this;

        me.$superFrame = $('#super-frame');

        if (!me.$superFrame.length) {
            me.$superFrame = $('<div id="super-frame"></div>');
            $('body').append(me.$superFrame);
        }
    }
    /*
     *  View render is the core function that your view should override
     */
    sfView.render = function(data, opts) {
        var me = this;

        if(me.$sfView && me.$sfView.length > 0) {
            return;
        }

        var sfViewHtml = [
            '<div class="sfa-view">',
                '<div class="sfa-head">',
                    '<a href="" class="sfa-back">back</a>',
                '</div>',
                '<div class="sfa-body">',
                    '<div class="sfa-result"><h1>' + data + '</h1></div>',
                '</div>',
            '</div>'
        ].join('');

        me.$sfView = $(sfViewHtml);
        me.$superFrame.append(me.$sfView);
	}

    /*
     * View attach, bind some events
     * record state, TODO
     */
    sfView.attach =  function() {
        var me = this;

        me.$sfView.find('.sfa-back').on('click', function(e) {
        	action.back();
            e.preventDefault();
        });
    }

    /*
     * View destroy
     */
	sfView.destroy = function() {
	    var me = this;

        me.$sfView.find('.sfa-back').off('click');
        me.$sfView.remove();
        me.$sfView = null;
	}

	return sfView;
});