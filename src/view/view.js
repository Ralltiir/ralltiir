/*
 * @file superframe view层
 * @author yangfan16
 * @date 2015-12-20
 * @update 2016-03-27 by yangfan: add set && update function
 */

define(function() {

    var action = require('../action');

    // 加载view公共css
    var $viewStyle = $('<style></style>');
    $viewStyle.text(__inline("./sfview.css"));
    $('head').append($viewStyle);


    var View = function (opt) {
        var me = this;
        // 设置默认值
        me.options = $.extend({
            sfid: '',                   // superframe id
            sfname: '',                 // superframe key name
            srcid: '',                  // 来源于某条结果的srcid(可选)
            order: '',                  // 来源于某条结果的order(可选)
            animateType: 'right',       // 入场出场动画类型
            duration: 300               // 动画持续时间
        }, opt);

        // 准备父容器
        me._init();

        // 加载sflog日志模块,加载时已绑定tclog事件代理
        //me.sflog = require('sf/sflog');
    };

    View.prototype = {

        version: '0.1.1',

        _init: function() {
            var me = this;

            me.set();
            me._prepareSFWrapper();
        },

        /*
         * 设置view初始参数的方法, 只能在render之前调用
         */
        set: function(opt) {
            var me = this;
            
            // 若$sfView已经存在, 说明此时已经render, do nth
            if (me.$sfview) {
                return;
            }

            // 设置默认值
            opt = opt || {};
            me.options = $.extend(me.options, opt);
            // 根据动画类型准备动画状态
            me._setAnimateState(me.options.animateType);
        },

        /*
         * 创建#super-frame父容器单例,所有view都append到这个dom中
         */
        _prepareSFWrapper: function() {
            var me = this;

            me.$superFrame = $('#super-frame');
            // 没有#super-frame
            if (!me.$superFrame.length) {
                me.$superFrame = $('<div id="super-frame"></div>');
                $('body').append(me.$superFrame);
            }
        },

        /*
         * 渲染view方法
         */
        render: function(opts) {
            var me = this;

            // 设置默认值
            me.options = $.extend({
                customClassName: '',        // 自定义样式
                headTitle: '',              // 自定义头部标题html
                headTool: '',               // 自定义头部右侧工具html
                headClose: false,           // 自定义关闭按钮,默认不显示
                bodyHtml: ''                // 自定义结果内容html
            }, me.options, opts);

            if(me.$sfView && me.$sfView.length > 0) {
                return;
            }

            var sfHeadHtml = [
                '<div class="sfa-head">',
                    '<div class="sfa-back"><i class="c-icon">&#xe783</i><span>返回</span></div>',
                    me.options.headClose ? '<div class="sfa-close"><span>关闭</span></div>' : '',
                    '<div class="sfa-tool">' + me.options.headTool + '</div>',
                    '<div class="sfa-title"><div class="c-line-clamp1">' + me.options.headTitle + '</div></div>',
                '</div>'
            ].join('');
            // title包裹两层div为了解决手百样式bug...wtf!
            // +1

            var sfBodyHtml = [
                '<div class="sfa-body">',
                '</div>'
            ].join('');

            // 初始化sf dom
            me.$sfView = $('<div class="sfa-view"></div>');
            me.$sfHead = $(sfHeadHtml);
            me.$sfBody = $(sfBodyHtml);

            if(me.options.bodyHtml) {
                me.$sfBody.html(me.options.bodyHtml);
            }

            // 组装sf dom
            me.$sfView.addClass(me.options.customClassName).css({
                'min-height': $(window).height()
            }).attr({
                'sfid': me.options.sfid,
                'sfname': me.options.sfname,
                'srcid': me.options.srcid,
                'order': me.options.order
            }).append(me.$sfHead).append(me.$sfBody);

            // 插入sf wrapper容器
            me.$superFrame.append(me.$sfView);

            // 绑定默认事件
            me._bindEvent();
        },

        /*
         * 更新view并重新渲染, 只能在render之后调用
         * 允许更新白名单: opt.headTitle-头部标题 / opt.headTool-右侧工具 / opt.bodyHtml-结果内容 / opt.holdView-是否保留view
         */
        update : function(opt) {
            var me = this;

            // 若$sfView不存在, 说明还未render, do nth
            if (!me.$sfView) {
                return;
            }

            // 更新view, 只允许更新headTitle/headTool/bodyHtml/holdView
            opt = opt || {};
            me.options = $.extend(me.options, {
                headTitle: opt.headTitle,        // 头部标题html
                headTool:  opt.headTool,         // 头部右侧工具html
                bodyHtml:  opt.bodyHtml,         // 结果内容html
                holdView:  opt.holdView          // destroy时是否保留view
            });

            // todo: 检查activity set/update连用依赖 去除默认执行开关
            // 更新标题html
            opt.headTitle && me.$sfHead.find('.sfa-title > div').html(me.options.headTitle);
            // 更新右侧工具html
            opt.headTool && me.$sfHead.find('.sfa-tool').html(me.options.headTool);
            // 更新内容html
            opt.bodyHtml && me.$sfBody.html(me.options.bodyHtml);
        },

        /*
         * 事件绑定方法
         */
        _bindEvent: function() {
            var me = this;

            // 绑定回退按钮事件
            me.$sfHead.find('.sfa-back').on('click', function(e) {
                action.back();
                e.preventDefault();
            });

            // 绑定关闭按钮事件
            // TODO 新框架下，需要redirect到结果页
            me.$sfHead.find('.sfa-close').on('click', function(e) {
                B.route.push('base');
                e.preventDefault();
            });
        },

        /*
         * JS发送tc日志方法
         * 基于sflog封装,使用该接口日志可merge view基础日志信息
         */
        sendtcLog: function(obj) {
            var me = this;

            if (typeof obj !== 'object') {
                return;
            }
            me.sflog.sendtcLog(obj, me.$sfView);
        },

        /*
         * JS发送webb行为日志方法
         * 基于sflog封装,使用该接口日志可merge view基础日志信息
         */
        sendWebbLog: function(obj) {
            var me = this;

            if (typeof obj !== 'object') {
                return;
            }
            me.sflog.sendWebbLog('other', obj, me.$sfView);
        },

        /*
         * JS拼接tc跳转链接方法
         * 基于sflog封装,使用该接口返回的tc链接可merge view基础日志信息
         * obj = {src:'', nsrc:'', clk_info:{}}
         * obj.src || obj.nsrc 必须有其一,src:非加密url, nsrc:加密url
         * obj.clk_info 可选, 与ubs约定的用于fe记录自定义统计信息的字段, 所有业务统计字段均放在该字段下
         */
        getJumpLinkUrl: function(obj) {
            var me = this;

            if (obj && (obj.src || obj.nsrc)) {
                return me.sflog.getJumpLinkUrl(obj, {
                    sfid: me.options.sfid,
                    sfname: me.options.sfname,
                    frsrcid: me.options.srcid,
                    frorder: me.options.order
                });
            }

            return '';
        },

        /*
         * 对应activity create状态
         * 入场动画准备开始
         * opts.useAnimate 是否使用动画
         */
        create: function(scope) {
            var me = this;
            var dtd = $.Deferred();

            var current = scope.to;

            // 判断是否使用入场动画
            me.enterAnimate = false;
            if (current && current.options 
                      && current.options.src !== 'history'
                      && current.options.src !== 'back' 
                      && me.options.useAnimate
                      && me.options.duration > 0) {
                me.enterAnimate = true;
            } else if (!scope && me.options.useAnimate && me.options.duration > 0) {
                me.enterAnimate = true;
            }

            // 使用动画
            if (me.enterAnimate) {
                // 设置动画起始状态并执行动画
                me.$sfView.css(me.animateState.enter[0]).animate(me.animateState.enter[1], me.options.duration, 'ease', function() {
                    dtd.resolve();
                });
            } else {
                me.$sfView.css(me.animateState.enter[1]).show();
                dtd.resolve();
            }

            return dtd.promise();
        },

        /*
         * 对应activity start状态
         * 入场动画action及结束
         * opts.useAnimate 是否使用动画, 该控制项作废, 动画状态在create中指定
         */
        start: function(scope) {
            var me = this;
            var current = scope.to;

            // 使用动画, 需要在start中设置sfview动画结束状态的样式
            me.$sfView.css(me.animateState.enter[2]);

            // 所有pushState操作均认为是开启新情景, 将页面滚动条默认置顶
            if (current && current.options && current.options.src !== 'history' && current.options.src !== 'back') {
                scrollTo(0, 0);
            }

            // 消除sfHead上的translate样式(这个样式是用来消除ios头部闪烁的)
            setTimeout(function(){
                me.$sfHead.css({
                    '-webkit-transform': 'none',
                    'transform': 'none'
                });
            }, 0);

            // 发送webb日志标识场景进入行为
            //me.sflog.sendWebbLog('show', {}, me.$sfView);
        },

        /*
         * 对应activity stop状态
         * 退场动画准备开始
         * opts.useAnimate 是否使用动画, 还同时受scope状态共同决定是否使用动画
         */
        stop: function(scope) {
            var me = this;
            var current = scope.to;

            // 判断是否使用出场动画
            me.exitAnimate = false;
            if (current && current.options 
                      && current.options.src === 'back' 
                      && me.options.useAnimate
                      && me.options.duration > 0) {
                me.exitAnimate = true;
            } else if (!scope && me.options.useAnimate && me.options.duration > 0) {
                me.exitAnimate = true;
            }

            // 发送webb日志标识场景退出行为
            //me.sflog.sendWebbLog('close', {}, me.$sfView);
        },

        /*
         * 对应activity destroy状态
         * 退场动画action及结束
         * opts.useAnimate 是否使用动画, 该控制项作废, 动画状态在stop中指定
         * opts.holdView 是否保留场景, 若为true,则不销毁场景,仅隐藏
         */
        destroy: function(scope) {
            var me = this;
            var dtd = $.Deferred();

            // 使用动画
            if (me.exitAnimate && scope && scope.to) {
                // 动画开始及动画运行状态都放在destroy中执行
                me.$sfView && me.$sfView.css(me.animateState.exit[0]).animate(me.animateState.exit[1], me.options.duration, 'ease', function() {
                    // 结束状态
                    me.$sfView.css(me.animateState.exit[2]);
                    // 销毁view
                    if(!(scope && scope.from.options && scope.from.options.view._hold === 1)) {
                        me._destroyView();
                    }
                    dtd.resolve();
                });
            } else {
                me.$sfView && me.$sfView.hide();
                // 销毁view，无参数传递时，也进行销毁
                if(!(scope && scope.from.options && scope.from.options.view._hold === 1)) {
                    me._destroyView();
                }
                dtd.resolve();
            }

            return dtd.promise();
        },

        /*
         * 销毁view方法
         */
        _destroyView: function() {
            var me = this;

            me.$sfHead.find('.sfa-back, .sfa-close').off('click');
            me.$sfView.remove();
            me.$sfView = null;
            me.$sfHead = null;
            me.$sfBody = null;
        },

        /*
         * 设置多种动画类型状态
         * TODO: 基础动画组件迁移至PMD中以zepto插件形式提供
         */
        _setAnimateState: function(animateType) {
            var me = this;

            me.animateState = {
                enter : [],
                exit : []
            };

            switch (animateType) {
                case 'right':
                    // 入场动画
                    me.animateState.enter.push({
                        'display': 'block',
                        'position': 'fixed',
                        'top': 0,
                        'left': 0,
                        'height': '100%',
                        'opacity': 0,
                        '-webkit-transform': 'translate3d(100%, 0, 0)',
                        'transform': 'translate3d(100%, 0, 0)'
                    });
                    me.animateState.enter.push({
                        'opacity': 1,
                        '-webkit-transform': 'translate3d(0, 0, 0)',
                        'transform': 'translate3d(0, 0, 0)'
                    });
                    me.animateState.enter.push({
                        'position': 'static',
                        'height': 'auto',
                        '-webkit-transform': 'none',
                        'transform': 'none'
                    });
                    // 退场动画
                    me.animateState.exit.push({
                        'position': 'fixed',
                        'top': 0,
                        'left': 0,
                        'height': '100%',
                        'opacity': 1,
                        '-webkit-transform': 'translate3d(0, 0, 0)',
                        'transform': 'translate3d(0, 0, 0)'
                    });
                    me.animateState.exit.push({
                        'opacity': 0,
                        '-webkit-transform': 'translate3d(100%, 0, 0)',
                        'transform': 'translate3d(100%, 0, 0)'
                    });
                    me.animateState.exit.push({
                        'display': 'none',
                        'position': 'static',
                        '-webkit-transform': 'none',
                        'transform': 'none'
                    });
                    break;
                case 'bottom':
                    // 入场动画
                    me.animateState.enter.push({
                        'display': 'block',
                        'position': 'fixed',
                        'top': 0,
                        'left': 0,
                        'height': '100%',
                        'opacity': 0,
                        '-webkit-transform': 'translate3d(0, 100%, 0)',
                        'transform': 'translate3d(0, 100%, 0)'
                    });
                    me.animateState.enter.push({
                        'opacity': 1,
                        '-webkit-transform': 'translate3d(0, 0, 0)',
                        'transform': 'translate3d(0, 0, 0)'
                    });
                    me.animateState.enter.push({
                        'position': 'static',
                        'height': 'auto',
                        '-webkit-transform': 'none',
                        'transform': 'none'
                    });
                    // 退场动画
                    me.animateState.exit.push({
                        'position': 'fixed',
                        'top': 0,
                        'left': 0,
                        'height': '100%',
                        'opacity': 1,
                        '-webkit-transform': 'translate3d(0, 0, 0)',
                        'transform': 'translate3d(0, 0, 0)'
                    });
                    me.animateState.exit.push({
                        'opacity': 0,
                        '-webkit-transform': 'translate3d(0, 100%, 0)',
                        'transform': 'translate3d(0, 100%, 0)'
                    });
                    me.animateState.exit.push({
                        'display': 'none',
                        'position': 'static',
                        '-webkit-transform': 'none',
                        'transform': 'none'
                    });
                    break;
                default:
                    return;
            }
        },

        constructor: View
    };

    return View;
});
