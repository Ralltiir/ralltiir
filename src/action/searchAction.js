define(function() {
    
    var basePageY;  // 记录结果页与activity切换时滚动条位置

    var exports = {};

    //执行action逻辑
    exports.do = function(current, prev) {
        location.reload();
    }
    
    /**
     *  上一状态destroy后，触发ready
     *
     * */
    exports.ready = function(current, prev) {
        // 恢复结果页滚动条位置
        if (typeof(basePageY) != "undefined") {
            scrollTo(0, basePageY);
        }
    }
    
    /**
     *  controller析构，不同controller切换时，需要执行此析构
     *  注意：析构的一定是scope中的last
     * */
    exports.destroy = function(current, prev) {
        // 采用absolute方式处理page隐藏，保持page内部layout，与route.js中方法一致
        basePageY = prev.page && prev.page.pageYOffset;
        var hidePageStyle = $('<style id="activitystyle">#page{width:100%;position:absolute;top:-99999px;opacity:0;}</style>');
        $('head').append(hidePageStyle);
    }

    return exports;

});
