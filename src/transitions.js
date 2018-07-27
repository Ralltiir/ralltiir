/**
 * @author harttle<yangjun14@baidu.com>
 * @file 页面切换动画控制中心
 */

define(function (require) {
    var transitions = [];
    var _ = require('@searchfe/underscore');

    /**
     * 注册一个动画实现
     *
     * @param {string} options.from     来源 Service 名称
     * @param {string} options.to       目标 Service 名称
     * @param {Function} options.impl   动画实现
     */
    function register(options) {
        options.impl = options.impl || _.noop;
        transitions.push(options);
    }

    function getImpl(from, to) {
        for (var i = 0; i < transitions.length; i++) {
            var transition = transitions[i];
            if (transition.from === from && transition.to === to) {
                return transition.impl;
            }
        }
    }

    return {register: register, getImpl: getImpl};
});
