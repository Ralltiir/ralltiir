define(function() {

    var View = function (opt) {
        this._init();
    };

    View.prototype = {

        _init: function() {},

        /**
         * 设置 view 初始参数
         * */
        set: function() {},

        get: function() {},

        create: function() {},

        /**
         *  DOM 渲染，核心 override 方法
         * */
        render: function() {},

        /**
         *  更新 View 并重新渲染
         * */
        update : function() {},

        attach: function() {},

        detach : function() {},

        /**
         * 销毁 View
         * */
        destroy: function() {},

        /**
         * 事件绑定
         * */
        on: function() {},

        /**
         * 事件解绑
         * */
        off: function() {}
    };

    return View;
});