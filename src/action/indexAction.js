define(function() {
    
    var basePageY;  // 记录结果页与activity切换时滚动条位置
    
    var exports = {};

    //执行action逻辑
    exports.do = function(current, prev) {
        window.view && window.view.trigger('start');
        //展现搜索框
        require(['../../uiamd/bdbox/util'], function(util) {
            util.fullScreen(false);
        });
    }
    
    /**
     *  上一状态destroy后，触发ready
     *
     * */
    exports.ready = function(current, prev) {
        // 恢复结果页滚动条位置
        if (typeof(basePageY) != "undefined") {
            scrollTo(0, basePageY);
        };
    }
    
    /**
     *  controller析构，不同controller切换时，需要执行此析构
     *  注意：析构的一定是scope中的last
     * */
    exports.destroy = function(current, prev) {
        window.view && window.view.trigger('stop');
    }

    return exports;

});
