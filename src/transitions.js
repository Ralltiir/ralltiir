/**
 * @author harttle<yangjun14@baidu.com>
 * @file 页面切换动画控制中心
 */

define(function (require) {
    var transitions = [];

    /**
     * 注册一个动画实现
     *
     * @param {string} fromName 来源
     * @param {string} toName   目标
     * @param {Function} impl     动画实现
     */
    function register(fromName, toName, impl) {
        transitions.push({fromName: fromName, toName: toName, impl: impl});
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

